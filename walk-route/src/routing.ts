import * as Location from 'expo-location';
import { LatLng, bearing, cumulative, decodePolyline, destination, distance } from './geo';

// Free, key-less services based on OpenStreetMap.
const VALHALLA_URL = 'https://valhalla1.openstreetmap.de/route';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const HEADERS = { 'User-Agent': 'WalkRoutePlanner/1.0 (personal use)', 'Accept-Language': 'he,en' };

export type Place = LatLng & { label: string };

export type Route = {
  path: LatLng[];
  cum: number[];
  lengthM: number;
  /** Waypoints used to shape the route (excluding start/end). */
  via: LatLng[];
  start: Place;
  end: Place;
  loop: boolean;
  /** Set when the requested distance could not be reached (e.g. shorter than the direct way). */
  note?: string;
};

// ---------- Geocoding ----------

export async function geocode(query: string): Promise<Place> {
  const q = query.trim();
  if (!q) throw new Error('נא להזין כתובת');
  // Coordinates typed directly, e.g. "32.08, 34.78"
  const m = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (m) return { lat: +m[1], lon: +m[2], label: q };

  try {
    const res = await fetch(
      `${NOMINATIM_URL}/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      { headers: HEADERS },
    );
    if (res.ok) {
      const data = await res.json();
      if (data.length) return { lat: +data[0].lat, lon: +data[0].lon, label: q };
    }
  } catch {
    // fall through to the device geocoder
  }
  const results = await Location.geocodeAsync(q).catch(() => []);
  if (results.length) return { lat: results[0].latitude, lon: results[0].longitude, label: q };
  throw new Error(`לא נמצאה הכתובת: ${q}`);
}

export async function reverseGeocode(p: LatLng): Promise<string> {
  try {
    const res = await fetch(
      `${NOMINATIM_URL}/reverse?format=json&zoom=18&lat=${p.lat}&lon=${p.lon}`,
      { headers: HEADERS },
    );
    if (res.ok) {
      const d = await res.json();
      const a = d.address ?? {};
      const street = [a.road, a.house_number].filter(Boolean).join(' ');
      const city = a.city || a.town || a.village || a.suburb || '';
      const label = [street, city].filter(Boolean).join(', ');
      if (label) return label;
    }
  } catch {
    // ignore
  }
  return `${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}`;
}

export async function currentPosition(): Promise<LatLng> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('אין הרשאת מיקום. אפשר לאשר אותה בהגדרות הטלפון.');
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { lat: pos.coords.latitude, lon: pos.coords.longitude };
}

// ---------- Walking routes ----------

type Leg = { path: LatLng[]; lengthM: number };

/** Ask Valhalla for a pedestrian route passing through all points in order. */
async function walkThrough(points: LatLng[]): Promise<Leg> {
  const body = {
    locations: points.map((p, i) => ({
      lat: p.lat,
      lon: p.lon,
      // "through" = pass by without stopping/turning back at that point
      type: i === 0 || i === points.length - 1 ? 'break' : 'through',
    })),
    costing: 'pedestrian',
    units: 'kilometers',
    directions_type: 'none',
  };
  const res = await fetch(VALHALLA_URL, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.trip) {
    throw new Error(data?.error ? `שגיאת ניתוב: ${data.error}` : 'שירות המסלולים לא זמין כרגע, נסו שוב');
  }
  const path: LatLng[] = [];
  for (const leg of data.trip.legs) {
    const pts = decodePolyline(leg.shape, 6);
    path.push(...(path.length ? pts.slice(1) : pts));
  }
  return { path, lengthM: data.trip.summary.length * 1000 };
}

const TOLERANCE = 0.05; // accept routes within ±5% of the target
const MAX_TRIES = 6;

/** Iteratively scale a shape parameter until the routed length is close to the target. */
async function fitLength(
  targetM: number,
  initialScale: number,
  build: (scale: number) => LatLng[],
): Promise<{ leg: Leg; via: LatLng[] }> {
  let scale = initialScale;
  let best: { leg: Leg; via: LatLng[]; err: number } | null = null;
  let lastError: unknown;
  for (let i = 0; i < MAX_TRIES; i++) {
    const pts = build(scale);
    try {
      const leg = await walkThrough(pts);
      const err = Math.abs(leg.lengthM - targetM) / targetM;
      if (!best || err < best.err) best = { leg, via: pts.slice(1, -1), err };
      if (err <= TOLERANCE) break;
      // Routed length grows roughly linearly with the shape scale; damp to avoid overshoot.
      const ratio = targetM / Math.max(leg.lengthM, 1);
      scale *= Math.pow(ratio, 0.9);
    } catch (e) {
      lastError = e;
      scale *= 0.85; // a waypoint may have landed somewhere unreachable; pull it in
    }
  }
  if (!best) throw lastError instanceof Error ? lastError : new Error('לא הצלחתי לבנות מסלול');
  return best;
}

/** A loop that starts and ends at `start`, about `targetM` meters long. */
export async function buildLoop(start: Place, targetM: number, seed = Math.random()): Promise<Route> {
  const heading = seed * 360;
  const n = 4; // points on the circle besides the start
  const typicalDetour = 1.25; // streets are longer than a perfect circle
  const r0 = targetM / (2 * Math.PI * typicalDetour);
  const build = (r: number) => {
    const center = destination(start, heading, r);
    const back = (heading + 180) % 360;
    const pts: LatLng[] = [start];
    for (let k = 1; k <= n; k++) pts.push(destination(center, back + (360 * k) / (n + 1), r));
    pts.push(start);
    return pts;
  };
  const { leg, via } = await fitLength(targetM, r0, build);
  return finish(leg, via, start, start, true, targetM);
}

/** From `start` to `end`, stretched with a detour to be about `targetM` meters long. */
export async function buildAtoB(start: Place, end: Place, targetM: number, seed = Math.random()): Promise<Route> {
  const d = distance(start, end);
  if (d < 150) {
    // Start and end are basically the same place: walk a loop.
    const r = await buildLoop(start, targetM, seed);
    return { ...r, end, loop: false };
  }
  const direct = await walkThrough([start, end]);
  if (direct.lengthM >= targetM * (1 - TOLERANCE)) {
    const note =
      direct.lengthM > targetM * (1 + TOLERANCE)
        ? `הדרך הקצרה ביותר בין הכתובות היא ${(direct.lengthM / 1000).toFixed(1)} ק"מ – יותר מהיעד שהוגדר`
        : undefined;
    return finish(direct, [], start, end, false, targetM, note);
  }

  // Trapezoid detour: A → P1 → P2 → B, where P1/P2 sit at 1/3 and 2/3 of the way,
  // offset sideways by h. Straight-line length = 2·√((d/3)² + h²) + d/3.
  const f = direct.lengthM / d; // how much longer streets are than a straight line here
  const third = d / 3;
  const straightTarget = targetM / f;
  const b = bearing(start, end);
  const side = seed < 0.5 ? 90 : -90;
  // The fitted parameter is the straight-line length S; the sideways offset follows from it.
  const build = (S: number) => {
    const h = Math.sqrt(Math.max(((S - third) / 2) ** 2 - third ** 2, 60 ** 2));
    const p1 = destination(destination(start, b, third), b + side, h);
    const p2 = destination(destination(start, b, 2 * third), b + side, h);
    return [start, p1, p2, end];
  };
  const { leg, via } = await fitLength(targetM, straightTarget, build);
  return finish(leg, via, start, end, false, targetM);
}

function finish(
  leg: Leg,
  via: LatLng[],
  start: Place,
  end: Place,
  loop: boolean,
  targetM: number,
  note?: string,
): Route {
  // Trust the router's length; rescale the vertex distances so progress tracking matches it.
  const raw = cumulative(leg.path);
  const lengthM = leg.lengthM || raw[raw.length - 1];
  const k = raw[raw.length - 1] > 0 ? lengthM / raw[raw.length - 1] : 1;
  const cum = raw.map((c) => c * k);
  if (!note && Math.abs(lengthM - targetM) / targetM > 0.12) {
    note = `לא נמצא מסלול באורך המדויק – זה הקרוב ביותר (${(lengthM / 1000).toFixed(1)} ק"מ). אפשר ללחוץ "מסלול אחר"`;
  }
  return { path: leg.path, cum, lengthM, via, start, end, loop, note };
}

/** Link that opens the route in Google Maps walking navigation. */
export function googleMapsUrl(route: Route): string {
  const fmt = (p: LatLng) => `${p.lat.toFixed(6)},${p.lon.toFixed(6)}`;
  // Google allows a few waypoints on mobile; sample the route so it follows our streets.
  const samples: LatLng[] = [];
  const count = 3;
  for (let k = 1; k <= count; k++) {
    const target = (route.lengthM * k) / (count + 1);
    const i = route.cum.findIndex((c) => c >= target);
    if (i > 0 && i < route.path.length - 1) samples.push(route.path[i]);
  }
  const params: Record<string, string> = {
    api: '1',
    origin: fmt(route.start),
    destination: fmt(route.end),
    travelmode: 'walking',
    waypoints: samples.map(fmt).join('|'),
  };
  const query = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  return `https://www.google.com/maps/dir/?${query}`;
}

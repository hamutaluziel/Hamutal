export type LatLng = { lat: number; lon: number };

const R = 6371000; // Earth radius, meters
const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Great-circle distance in meters. */
export function distance(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Initial bearing from a to b, degrees 0..360. */
export function bearing(a: LatLng, b: LatLng): number {
  const y = Math.sin(toRad(b.lon - a.lon)) * Math.cos(toRad(b.lat));
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(toRad(b.lon - a.lon));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Point reached by going `meters` from `p` on bearing `deg`. */
export function destination(p: LatLng, deg: number, meters: number): LatLng {
  const d = meters / R;
  const b = toRad(deg);
  const lat1 = toRad(p.lat);
  const lon1 = toRad(p.lon);
  const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(b));
  const lon2 =
    lon1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
  return { lat: toDeg(lat2), lon: ((toDeg(lon2) + 540) % 360) - 180 };
}

/** Decode a Valhalla encoded polyline (precision 6 by default). */
export function decodePolyline(str: string, precision = 6): LatLng[] {
  const factor = 10 ** precision;
  const out: LatLng[] = [];
  let index = 0, lat = 0, lon = 0;
  while (index < str.length) {
    for (const which of [0, 1]) {
      let shift = 0, result = 0, byte: number;
      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (which === 0) lat += delta;
      else lon += delta;
    }
    out.push({ lat: lat / factor, lon: lon / factor });
  }
  return out;
}

/** Cumulative distance (meters) at each vertex of a path. */
export function cumulative(path: LatLng[]): number[] {
  const c = [0];
  for (let i = 1; i < path.length; i++) c.push(c[i - 1] + distance(path[i - 1], path[i]));
  return c;
}

/**
 * Project a point onto the route: how far along the route (meters) the closest point is,
 * and how far the point is from the route. Only segments overlapping [fromAlong, toAlong]
 * are considered, so on loops that cross themselves progress does not jump around.
 */
export function projectOnRoute(
  p: LatLng,
  path: LatLng[],
  cum: number[],
  fromAlong = 0,
  toAlong = Infinity,
): { along: number; offRoute: number } {
  let best = { along: 0, offRoute: Infinity };
  // Local flat projection (fine at walking scales).
  const kx = Math.cos(toRad(p.lat)) * 111320;
  const ky = 110540;
  for (let i = 0; i < path.length - 1; i++) {
    if (cum[i + 1] < fromAlong || cum[i] > toAlong) continue;
    const ax = (path[i].lon - p.lon) * kx, ay = (path[i].lat - p.lat) * ky;
    const bx = (path[i + 1].lon - p.lon) * kx, by = (path[i + 1].lat - p.lat) * ky;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 > 0 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
    const cx = ax + t * dx, cy = ay + t * dy;
    const off = Math.sqrt(cx * cx + cy * cy);
    if (off < best.offRoute) best = { along: cum[i] + t * (cum[i + 1] - cum[i]), offRoute: off };
  }
  return best;
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0');
  const ss = String(sec).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Pace as "m:ss" minutes per km from speed in km/h. */
export function formatPace(kmh: number): string {
  if (!isFinite(kmh) || kmh <= 0.3) return '—';
  const secPerKm = 3600 / kmh;
  return formatDuration(secPerKm);
}

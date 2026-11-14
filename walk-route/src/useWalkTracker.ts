import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { LatLng, distance, projectOnRoute } from './geo';
import type { Route } from './routing';

export type WalkStats = {
  running: boolean;
  paused: boolean;
  elapsedSec: number;
  walkedM: number; // GPS distance actually walked
  alongM: number; // progress along the planned route
  currentKmh: number; // speed over the last ~30 seconds
  avgKmh: number;
  /** Positive = ahead of the planned pace, in meters. */
  aheadM: number;
  offRouteM: number;
  finished: boolean;
  user: LatLng | null;
};

const EMPTY: WalkStats = {
  running: false,
  paused: false,
  elapsedSec: 0,
  walkedM: 0,
  alongM: 0,
  currentKmh: 0,
  avgKmh: 0,
  aheadM: 0,
  offRouteM: 0,
  finished: false,
  user: null,
};

const KEEP_AWAKE_TAG = 'walk';

export function useWalkTracker(route: Route | null, targetKmh: number) {
  const [stats, setStats] = useState<WalkStats>(EMPTY);
  const sub = useRef<Location.LocationSubscription | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  // Mutable tracking state (not React state, to avoid stale closures in callbacks).
  const s = useRef({
    movingMs: 0,
    lastTick: 0,
    paused: false,
    walkedM: 0,
    alongM: 0,
    last: null as LatLng | null,
    recent: [] as { t: number; d: number }[], // timestamp + cumulative walked distance
  });

  const stopWatching = () => {
    sub.current?.remove();
    sub.current = null;
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    deactivateKeepAwake(KEEP_AWAKE_TAG);
  };

  useEffect(() => stopWatching, []);

  const compute = useCallback(
    (user: LatLng | null, offRouteM: number): WalkStats => {
      const st = s.current;
      const elapsedSec = st.movingMs / 1000;
      const recent = st.recent;
      let currentKmh = 0;
      if (recent.length > 1) {
        const a = recent[0], b = recent[recent.length - 1];
        const dt = (b.t - a.t) / 1000;
        if (dt > 5) currentKmh = ((b.d - a.d) / dt) * 3.6;
      }
      const plannedM = (targetKmh / 3.6) * elapsedSec;
      const total = route?.lengthM ?? 0;
      return {
        running: true,
        paused: st.paused,
        elapsedSec,
        walkedM: st.walkedM,
        alongM: st.alongM,
        currentKmh,
        avgKmh: elapsedSec > 10 ? (st.walkedM / elapsedSec) * 3.6 : 0,
        aheadM: st.alongM - Math.min(plannedM, total),
        offRouteM,
        finished: total > 0 && st.alongM >= total - 30,
        user,
      };
    },
    [route, targetKmh],
  );

  const onPosition = useCallback(
    (loc: Location.LocationObject) => {
      const st = s.current;
      const p = { lat: loc.coords.latitude, lon: loc.coords.longitude };
      const acc = loc.coords.accuracy ?? 999;
      let offRoute = 0;
      if (!st.paused && acc <= 35) {
        if (st.last) {
          const step = distance(st.last, p);
          // Ignore GPS jitter and impossible jumps.
          if (step >= 3 && step < 100) {
            st.walkedM += step;
            st.last = p;
          } else if (step >= 100) {
            st.last = p;
          }
        } else {
          st.last = p;
        }
        const now = Date.now();
        st.recent.push({ t: now, d: st.walkedM });
        while (st.recent.length > 2 && now - st.recent[0].t > 30000) st.recent.shift();

        if (route) {
          // Look a little behind and ahead of current progress first, then the whole route.
          let proj = projectOnRoute(p, route.path, route.cum, st.alongM - 60, st.alongM + 500);
          if (proj.offRoute > 40) proj = projectOnRoute(p, route.path, route.cum);
          offRoute = proj.offRoute;
          if (proj.offRoute <= 40) st.alongM = Math.max(st.alongM, proj.along);
        }
      }
      setStats(compute(p, offRoute));
    },
    [route, compute],
  );

  const start = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw new Error('אין הרשאת מיקום. אפשר לאשר אותה בהגדרות הטלפון.');
    stopWatching();
    s.current = { movingMs: 0, lastTick: Date.now(), paused: false, walkedM: 0, alongM: 0, last: null, recent: [] };
    setStats({ ...EMPTY, running: true });
    await activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    sub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 2000, distanceInterval: 3 },
      onPosition,
    );
    timer.current = setInterval(() => {
      const st = s.current;
      const now = Date.now();
      if (!st.paused) st.movingMs += now - st.lastTick;
      st.lastTick = now;
      setStats((prev) => ({ ...compute(prev.user, prev.offRouteM) }));
    }, 1000);
  }, [onPosition, compute]);

  const togglePause = useCallback(() => {
    const st = s.current;
    st.paused = !st.paused;
    st.last = null; // don't count the distance moved while paused
    st.recent = [];
    setStats((prev) => ({ ...prev, paused: st.paused }));
  }, []);

  const stop = useCallback(() => {
    stopWatching();
    setStats((prev) => ({ ...prev, running: false, paused: false }));
  }, []);

  const reset = useCallback(() => {
    stopWatching();
    setStats(EMPTY);
  }, []);

  return { stats, start, togglePause, stop, reset };
}

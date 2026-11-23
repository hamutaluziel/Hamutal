# Sella Ronda snow dashboard

Export of the hosted Instinct File https://files.instinct.com/rgg20cbn7l5o,
generation 26 (revision `filerevision-01M7YJ79QFD3Z976PWD95148ED`), exported
21 Nov 2026. The published source is included unchanged.

## What is here

- `src/` - the complete published source, byte-for-byte (React 18 + TypeScript SPA)
  - `src/App.tsx` - the whole dashboard: 24 places across Val Gardena, Seceda/Alpe di Siusi,
    the Dolomite passes, Val di Fassa, Alta Badia and Arabba; Open-Meteo weather fetch;
    snowfall/depth charts; compare section; webcam frames; auto-refresh every 10 minutes
  - `src/main.tsx` - entry point; registers the bundled woff2 fonts via FontFace
  - `src/style.css` - all styles (warm light "Swedish" flat design system)
  - `src/photos/`, `src/fonts/` - bundled assets
- `file.json` - hosted-Files manifest: the origins the viewer lets the page fetch
  cross-origin (Open-Meteo + webcam image hosts). Vite does not use it; it is kept as
  the reference list of external hosts the app depends on.
- `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `shims/` - local-dev
  scaffolding added for this export so the project runs outside the hosted viewer.
  These are NOT part of the published revision.

## Run locally

    npm install
    npm run dev

Open the printed URL. `npm run build` produces a static bundle in `dist/`.

## Platform differences to know

- `@instinct/files` (`FileRouter`, `FileCard`) is provided by the hosted viewer at runtime.
  Local runs use `shims/instinct-files.tsx` through a Vite alias; the published source
  is untouched.
- Live weather comes from `api.open-meteo.com` (no key, CORS-open), so all data works locally.
- Webcam frames are fetched directly from provider hosts (the `file.json` origins). In the
  hosted viewer those origins are whitelisted; in local dev the browser enforces normal CORS,
  so some frames may fail and show the app's offline state. The app handles that gracefully.
- Panomax 360 cams resolve their latest frame at runtime via `api.panomax.com`
  (see the `pano:` handling in `src/App.tsx`).

## Data rules baked into the app

- Open-Meteo's `snowfall` field is the only snowfall figure ever displayed.
- Snow-depth change is an internal discrepancy flag only, never shown as snowfall.
- Ground depth is always labeled as a modeled value.
- No wind data anywhere. English UI.

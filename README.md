# Anduril

Local intelligence dashboard with a teal/slate theme, keyboard command search, an interactive globe, relationship graph, and stylometric comparison.

## Local review

```sh
npm ci --no-audit
npm run build
npm start
```

Open http://localhost:3000. To use a different port: `PORT=3100 npm start`.

- Toggle the sun/moon button; the theme persists on reload.
- Press Ctrl+K or Cmd+K, type an actor, IP, or onion address, then use arrows and Enter to open its dossier.
- Drag or zoom the globe. The local vector map remains visible when WebGL or geographic data cannot load.
- In Graph, search an entity, filter by type, toggle layout physics, and use the inspector to open linked dossiers.
- In AI Stylometry, load a sample or paste text, then compare markers and ranked candidates.
- On small screens, use the menu button to open navigation.

The backend still uses the repository's local datasets and existing stylometry scoring. UI modernization does not turn these into verified live intelligence or a trained attribution model. Illustrative activity telemetry is labeled in the dashboard.

## Validation

```sh
npm test
```

Browser tests use Chromium at `/usr/bin/chromium`; set `CHROMIUM_PATH` for another installation. The test runner starts a local server on port 3100 if one is not already running. Tests cover search destinations, keyboard/focus behavior, persistent themes, graph controls, globe interaction/fallback, API errors, reduced motion, and responsive view containment.

Run `npm run build` after changing HTML, utility classes, or asset dependencies. The generated CSS and browser libraries are kept in `public/`, so the frontend does not require external CDNs. Motion uses CSS transitions and respects reduced-motion preferences.

Map geometry comes from [world-atlas / Natural Earth](https://github.com/topojson/world-atlas) and is projected with [d3-geo](https://github.com/d3/d3-geo). The globe uses [globe.gl](https://github.com/vasturiano/globe.gl). Dependency licenses are included under `public/vendor/licenses` and in the distributed library headers.

Brand cleanup: persona dossiers export their actual evidence; Discover opens matching dossiers; Reports exports current actor records. Watchlist additions/removals and alert acknowledgments/dismissals persist in this browser. Unimplemented persona tabs, report-history buttons, and investigation create/archive actions were removed.

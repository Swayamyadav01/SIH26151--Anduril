# Prototype Build Plan — SHADOWLINK SIH 26151 (offline-safe, simulated)

Target: 6-min SIH judging demo. Zero live Tor dependency on stage.

## 0. Decisions locked
- Acunetix: licensed, but SIMULATED in demo (`mode:simulated`, `X-Simulated:true`).
- Demo mode: fully simulated fixtures.
- Timeline: full event timeline (`events.json` + `?from&to`).
- Scan profile: origin-only-6 (no Full Scan, no SSL/status here — that's Module 2).

## 1. Boot fix (do first — repo currently crashes)
- `server.js:11,13`: `wath.join` → `path.join`
- `server.js:36`: `auery` → `query`
- Recreate missing (empty now, required by `public/index.html`):
  - `public/js/app.js` — stats + timeline filter fetch
  - `public/js/graph.js` — vis-network render of `/api/graph`
  - `public/js/scanner.js` — split view passive + Acunetix-sim
  - `public/js/stylometry.js` — match + Chart.js 24h wheel
  - `public/js/export.js` — CSV/JSON/print
  - `public/css/style.css` — minimal cyber theme

## 2. Module 2 — Finding thru Certs (build first, easiest win)
- Uses existing `data/hidden_services.json`.
- `POST /api/scan` → return `misconfigurations[]`: server-status, SSL SAN via crt.sh mock, banner, descriptor, ETag, JARM, SSH reuse, favicon.
- Cert=Yes → score + CONTINUE (never END).
- Patch: add `source, last_scan_date, reliability` to each misconfig. Add `GET /api/sources`.
- UI: `tab-scanner` top half + `tab-overview` recent de-anons.

## 3. Module 1 — Web Vuln Finding (origin-only-6, Acunetix-sim via Proxify log)
- Profile (only these): SSRF-blind (AcuMonitor OOB), SQLi-OOB, RCE/OS-cmd blind, LFI/Traversal (torrc/nginx/env/hostname), RFI, XXE-OOB/SSTI-OOB.
- Excluded: XSS, CSRF, open-redirect alone, clickjacking, in-band SQLi w/o OOB.
- Lab (once, pre-SIh): `Acunetix → Proxify 127.0.0.1:8888 → upstream SOCKS5h 127.0.0.1:9050 (tor) → lab onion you own` + AcuMonitor OOB. Save sanitized log screenshot for PPT.
- Fixtures: `data/acunetix_scans/<onion>.json`:
  `{onion_address, mode:simulated, scan_profile:origin-only-6, vulns:[{type,param,severity,evidence,oob_hit:{ip,timestamp}}], origin_attribution:{clearnet_ip,confidence_score,matching_indicators}}`
- Need 2 fixtures: 1 vuln (IntelBroker lab clone → SSRF OOB 185.220.101.45, 96.8%), 1 clean (→ fallback to stylometry).
- API: `POST /api/scan/active` → fixture loader. Live REST poller stubbed behind `ACUNETIX_ENABLED=false`.
- UI: `tab-scanner` bottom half table Type/Param/Severity/Evidence/OOB IP + `SIMULATED - lab data only` badge.

## 4. Module 3 — Finding via Stylometry
- Keep `POST /api/stylometry/match`.
- New `data/events.json`: `{event_id,actor_id,type:handle|leak|scan|wallet_tx|pgp,timestamp,source,detail}` seeded from `last_active/scan_date/first_seen`.
- New `GET /api/timeline?actor_id&from&to`.
- Patch `data/threat_actors.json`: add `source,last_seen` to handles/wallets/pgp.
- Sources mocked: ahmia.fi crawl, blockchair.com, forums. Reliability tags.
- UI: `tab-stylometry` workbench + 24h wheel, `tab-search` with from/to filter, graph hover shows source.

## 5. Integration
- `GET /api/graph` — add source on edges.
- `tab-overview` — scheduler log mock (crawl 6h, cert 12h, shodan 24h) + reliability table + last_system_update.
- `tab-export` — CSV/JSON/Print with timeline + source + confidence + `lab-data-only` footer.
- All data framed as `mock/osint-lab, authorized targets only`.

## 6. Prototype acceptance
1. Boot with no crash, all 6 tabs render offline.
2. IntelBroker onion → passive + SSRF OOB → 185.220.101.45 96.8%.
3. Clean onion → No vuln → stylometry fallback works.
4. `?from=2026-09-01&to=2026-09-12` filters graph/timeline.
5. Export contains timeline+source+confidence.
6. `::` sample → IntelBroker 90%+ match + wheel renders.

# Full Project Build Plan — SHADOWLINK SIH 26151 (production system)

Target: college project report + maintainable system. Reuses prototype APIs/schemas, swaps fixtures for live services.

## 0. Baseline
- Start from working prototype (boot fixed, 3 modules simulated, timeline + export demoable).
- Keep `scan_profile: origin-only-6` for active scans; Full Scan stays out by design.

## 1. Storage: JSON → DB
- Migrate `threat_actors.json, hidden_services.json, stylometric_corpus.json, events.json, acunetix_scans/` → SQLite (dev) / Postgres (prod) with migrations.
- Tables: actors, handles (with source,last_seen,reliability,trust), pgp_keys, wallets (with first_seen, tx refs), hidden_services, misconfigs (with source,last_scan_date), events (indexed timestamp), scans (fixture vs live, profile, oob_hit).
- Add `GET /api/timeline` pagination + full-text search + CSV/JSON streaming export.

## 2. Module 2 (real passive)
- Connectors: crt.sh API (SAN history), Shodan/Censys APIs (JARM/SSH/banner/favicon), direct Tor SOCKS5h fetch for headers/ETag/status (with allowlist + rate limit).
- Scheduler: crawl 6h, cert 12h, shodan 24h via node-cron / BullMQ. Store `last_scan_date`, dedupe by onion+type.
- Confidence engine: weighted score (SSL 30, status 25, JARM 15, SSH 20, ETag/favicon 10) → 0-100% with explanation.

## 3. Module 1 (real active, guarded)
- Acunetix Enterprise REST: `POST /targets + /scans (origin-only-6 template) → poll → GET /vulnerabilities` with API-key from env, `ACUNETIX_ENABLED=true` only for allowlisted lab onions.
- Chain: `Acunetix → Proxify 127.0.0.1:8888 (permanent evidence proxy, DSL oob||ssrf||sqli-oob||rce||traversal, PII/session redaction) → upstream SOCKS5h Tor → target`. AcuMonitor OOB mandatory for blind classes.
- Safety: explicit consent/ownership check, 1-2 rps, 30s timeout, kill-switch, audit log of who scanned what/when. Never scan arbitrary onions.
- Keep fixture fallback when Tor/Acunetix unreachable.

## 4. Module 3 (real persona)
- Crawlers: Ahmia.fi API, forum RSS/HTML (respect robots + auth), blockchair.com wallet tx API. Normalize to events table with source+reliability.
- Stylometry v2: TF-IDF + punctuation/emoji/separator features + timezone histogram from real timestamps (replace heuristic random boost in current `server.js:146`).
- PGP: keyserver fingerprint lookup. Wallet: clustering + exchange-tag lookup (read-only).

## 5. Platform hardening
- Auth + roles (analyst/viewer), API keys, audit trail.
- Input validation (onion v3 regex), output redaction (mask PII in exports by role).
- Docker Compose: app + db + tor daemon + proxify + redis queue. Healthchecks, structured logs.
- Tests: unit (confidence, stylometry), integration (fixture APIs), e2e (playwright on 6 tabs). CI + lint.

## 6. Docs & compliance
- README: architecture diagram (passive → active OOB → persona → graph), scan-profile rationale (why not Full Scan), Tor+Acunetix+Proxify wiring diagram.
- Ethics page: authorized-targets-only, lab-data labeling, data retention/redaction policy.
- Report: mapping of every PS bullet (misconfig/graph/AI/timeline/autonomous/export) to endpoint + screenshot.

## 7. Build order
1. DB migration (keep API shapes).
2. Module 2 real connectors + scheduler.
3. Module 1 live Acunetix+Proxify behind flags.
4. Module 3 crawlers + stylometry v2.
5. Auth, Docker, tests, docs.

## 8. Done when
- Live scan of own lab onion via Acunetix+Proxify+Tor produces OOB evidence stored in DB and rendered in scanner UI.
- Timeline query across 30d returns <500ms with source filter.
- Clean `docker compose up` boots all services; `npm test` green.

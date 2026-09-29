<div align="center">

<img src="public/assets/anduril-mark.svg" alt="Anduril Logo" width="84" height="84" />

# Anduril — DeProxy Threat Intelligence Platform
### *Enterprise Dark Web De-Anonymization, Onion Forensics & Linguistic Attribution*

[![Tests](https://img.shields.io/badge/Playwright_E2E-12%2F12_Passed-14b8a6?style=for-the-badge&logo=playwright&logoColor=white)](tests/ui.spec.js)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Production_Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)](vercel.json)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](package.json)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](public/vendor/licenses/)
[![Design](https://img.shields.io/badge/Design_System-21st.dev_%7C_Slate_%26_Teal-0f172a?style=for-the-badge)](public/css/style.css)

<p align="center">
  <b>A state-of-the-art cyber intelligence workbench designed for threat researchers, forensic analysts, and law enforcement.</b><br/>
  Featuring real-time WebGL globe telemetry, stabilized link-analysis graphs, and computational stylometry.
</p>

[Key Features](#-key-features) •
[Interactive Capabilities](#-interactive-capabilities) •
[Architecture](#-system-architecture) •
[Quick Start](#-quick-start) •
[API Reference](#-api-endpoints) •
[Verification & Testing](#-automated-testing--validation) •
[Vercel Deployment](#-vercel-deployment)

</div>

---

## 🌟 Executive Summary

**Anduril** (formerly DeProxy) is an intelligence platform engineered to track threat actors across Tor hidden services (`.onion`), identify origin infrastructure through cryptographic and passive fingerprinting (JARM, Favicon MMH3, SSL Serials), and conduct NLP-driven linguistic stylometry to identify author identities across disparate underground forums.

Modernized with a curated **Slate & Teal** visual design inspired by *21st.dev*, it abandons generic "hacker neon" tropes in favor of an ergonomic, high-density, Palantir-grade intelligence interface.

---

## 🚀 Key Features

| Capability | Technical Implementation | Highlights |
| :--- | :--- | :--- |
| **🌍 3D Threat Telemetry Globe** | WebGL / Three.js (`globe.gl`) | Real-time rotating globe with traffic flow arcs, pulsating origin radar dots (e.g., Bucharest, Moscow), and automated offline SVG fallback. |
| **🕸️ Link-Analysis Graph** | Force-directed Network (`vis-network`) | Stabilized topology engine with physics auto-freeze, node type filters, entity zoom-focus, and integrated forensic inspector dossier. |
| **🧠 NLP Stylometric Attribution** | Statistical NLP & Lexical Profiling | Multi-factor authorship verification analyzing vocabulary richness, punctuation entropy, sentiment divergence, and signature tokens. |
| **⚡ Command Search Palette** | Global keyboard event listener (`Ctrl + K` / `Cmd + K`) | Instant modal search with arrow-key navigation across threat actors, `.onion` services, and unmasked origin IP addresses. |
| **🛡️ Hidden Service De-Anonymization** | Dual Node.js & Python Passive Audit Engine | Automated Shodan/FOFA reconnaissance dork builder, Favicon hash correlation, TLS certificate matching, and active probe pipelines. |
| **🌓 Adaptive Dark / Light Mode** | CSS Custom Properties + `localStorage` | Seamless contrast-optimized theming across all charts, cards, modals, and vector assets. |
| **📦 100% Air-Gapped Ready** | Local vendor bundles (`public/vendor/`) | Zero runtime dependency on external CDNs; runs completely offline in high-security air-gapped environments. |

---

## 🖥️ Interactive Capabilities

<details open>
<summary><b>1. Global Command Palette (<code>Ctrl + K</code> / <code>Cmd + K</code>)</b></summary>
<br>

Search across all intelligence databases instantaneously:
- **Instant Search:** Trigger from anywhere via keyboard shortcut or header button.
- **Deep Linking:** Hit `Enter` or click on any record to automatically route to its comprehensive dossier (Personas, Services, or Infrastructure).
- **Accessible Navigation:** Complete focus-trap and keyboard arrow-key navigation with escape dismissal.

</details>

<details>
<summary><b>2. 3D WebGL Threat Globe & Offline Fallback</b></summary>
<br>

- **Real-time Visualization:** Displays geographic origin attributions, active command-and-control nodes, and monitored relays with smooth Three.js physics.
- **Resilient Fallback:** When WebGL acceleration or network geography is disabled, the platform automatically renders an offline vector world-map generated from Natural Earth TopoJSON geometry.
- **Reduced Motion Support:** Respects system accessibility preferences (`prefers-reduced-motion`) by halting automated rotation and pulse effects.

</details>

<details>
<summary><b>3. Stabilized Forensic Topology Graph</b></summary>
<br>

- **Game-Jitter Elimination:** Physics run temporarily upon initial load and auto-freeze once nodes settle, preventing endless bouncing or layout instability.
- **Entity Type Filtering:** Dynamically isolate `Threat Actors`, `Hidden Services`, `Origin IPs`, `Wallets`, or `Leaked Databases`.
- **Forensic Inspector:** Clicking any node reveals an evidence dossier sidebar displaying attributes, confidence ratings, and linked entities.

</details>

<details>
<summary><b>4. AI Stylometry & Authorship Attribution</b></summary>
<br>

Compare intercepted threat actor communiqués, dark web forum posts, or ransom notes against indexed author baselines:
- **Lexical Richness:** Shannon entropy and type-token ratio (TTR) calculation.
- **Syntactic Markers:** Comma splices, semicolon frequency, bracket usage, and capitalization habits.
- **Ranked Attribution Score:** Output candidate rankings with confidence intervals and highlighted forensic signature phrases.

</details>

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[Browser Frontend / Client]
    
    subgraph UI_Layer [User Interface & Visualization]
        Nav[View Router & App State]
        Palette[Ctrl+K Command Palette]
        Globe[3D WebGL Globe & Vector Fallback]
        Graph[Stabilized Link Topology]
        StylometryUI[Stylometry Lab UI]
    end
    
    subgraph Core_Server [Express.js Core Engine]
        Server[server.js / Dual-Port Listener]
        API_Stats[/api/stats]
        API_Graph[/api/graph]
        API_Actors[/api/actors]
        API_Stylometry[/api/stylometry/match]
        API_Dorks[/api/audit/dorks]
    end
    
    subgraph Recon_Engine [Passive Audit & De-Anonymization]
        NodeAudit[audit_service.js (Serverless Fallback)]
        PyAudit[dork_builder.py / passive_auditor.py]
    end
    
    Client --> Palette
    Palette --> Nav
    Nav --> Globe
    Nav --> Graph
    Nav --> StylometryUI
    
    Globe --> API_Stats
    Graph --> API_Graph
    StylometryUI --> API_Stylometry
    Nav --> API_Actors
    Nav --> API_Dorks
    
    API_Dorks --> NodeAudit
    API_Dorks --> PyAudit
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- *(Optional)* **Python 3.8+** with `shodan` / `fofa` modules for active probe scripts

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/Swayamyadav01/darkweb.git
cd darkweb

# Install packages with frozen lockfile
npm ci --no-audit
```

### 2. Build Assets (Offline Bundling & Tailwind CSS)

```bash
npm run build
```
*Compiles the Tailwind CSS design system and bundles local vendor libraries (`chart.umd.js`, `vis-network.min.js`, `globe.gl.min.js`, and FontAwesome assets).*

### 3. Start the Platform

```bash
# Starts server on default port 3000 (and secondary listener 3100)
npm start
```

Access the dashboard in your web browser:
👉 [**http://localhost:3000**](http://localhost:3000) *(or [http://localhost:3100](http://localhost:3100))*

To specify a custom port:
```bash
PORT=8080 npm start
```

---

## 🧪 Automated Testing & Validation

The codebase includes an end-to-end test suite powered by **Playwright**, validating accessibility, WebGL fallbacks, search keyboard interactions, and responsive UI containment across viewports.

```bash
# Execute the full test suite
npm test
```

### Verified Test Matrix:
```
  ✓  1  dashboard, repeated themes, persistence, no external assets or runtime errors
  ✓  2  command palette opens exact actor, IP and onion dossiers with keyboard and click
  ✓  3  palette arrow selection, focus trap, Escape and no matches
  ✓  4  globe rotates, zooms, resizes and is disposed when navigating away
  ✓  5  accurate vector fallback survives unavailable WebGL library and slow geometry
  ✓  6  graph freezes, searches, filters, themes, unlocks and opens linked dossier
  ✓  7  stylometry handles empty input, results, markers and API failures
  ✓  8  all views render without errors and mobile navigation keeps viewport contained
  ✓  9  API load failure has a working retry
  ✓ 10  reduced motion disables globe rotation and pulse animation
  ✓ 11  long onion addresses and wallet hashes stay inside table bounds
  ✓ 12  actual WebGL failure keeps vector map visible

  Result: 12 passed (100% green)
```

---

## 📡 API Endpoints

The Express server exposes RESTful endpoints supporting JSON payloads:

| Endpoint | Method | Description | Sample Output |
| :--- | :---: | :--- | :--- |
| `/api/stats` | `GET` | Aggregated threat counters, active scanners, unmasked origin IPs | `{"total_threat_actors": 5, "deanonymized_origin_ips": 4, ...}` |
| `/api/actors` | `GET` | Forensic catalog of indexed threat actor profiles | List of actor objects with aliases, CVEs, and BTC wallets |
| `/api/actors/:id` | `GET` | Individual threat actor dossier & evidence records | Deep intelligence record with timeline & attribution data |
| `/api/graph` | `GET` | Nodes and edges formatted for network topology analysis | `{nodes: [...], edges: [...]}` |
| `/api/infrastructure` | `GET` | Monitored hidden services, JARM hashes, origin IP attributions | Full list of indexed `.onion` infrastructure nodes |
| `/api/stylometry/match` | `POST` | Execute NLP stylometric analysis against suspect text | `{"matches": [{"actor": "GhostWeaver", "score": 94.2}], ...}` |
| `/api/audit/dorks` | `GET` | Generate passive FOFA / Shodan reconnaissance dorks | `{"dorks": {"shodan": [...], "fofa": [...]}}` |

---

## ☁️ Vercel Deployment

Anduril is pre-configured for automated serverless deployment on [Vercel](https://vercel.com):

1. **Serverless Entrypoint:** [server.js](server.js) exports the Express `app` instance (`module.exports = app`).
2. **Configuration:** [vercel.json](vercel.json) routes incoming requests directly to the serverless function runtime.
3. **Optimized Ignore Rules:** [.vercelignore](.vercelignore) prevents test artifacts and development scripts from bloating the build bundle.
4. **Native Node.js Fallback:** [backend/modules/passive_audit/audit_service.js](backend/modules/passive_audit/audit_service.js) provides pure JavaScript execution of passive dork builders when Python is unavailable in serverless runtimes.

Deploy directly via Git:
```bash
git push origin main
```
*Any commit pushed to `main` automatically triggers a zero-config production build on your linked Vercel project.*

---

## 📂 Project Directory Structure

```plaintext
DarkWeb--main/
├── backend/
│   └── modules/
│       └── passive_audit/
│           ├── audit_service.js       # Native Node.js dork & audit engine (Vercel-compatible)
│           ├── dork_builder.py        # Python passive reconnaissance dork generator
│           └── passive_auditor.py     # Certificate serial, favicon & JARM analyzer
├── public/
│   ├── assets/                        # SVG marks, favicons, TopoJSON offline maps
│   ├── css/
│   │   ├── style.css                  # Modernized 21st.dev slate/teal design system
│   │   └── tailwind.css               # Compiled utility stylesheet
│   ├── js/
│   │   ├── app.js                     # SPA router, state container & command palette
│   │   └── views/                     # Modular view controllers
│   │       ├── dashboard.js           # 3D Globe telemetry & metric cards
│   │       ├── graph.js               # Stabilized link topology graph
│   │       ├── stylometry.js          # NLP forensic attribution lab
│   │       └── personas.js            # Forensic actor dossiers & leak archives
│   └── vendor/                        # Air-gapped self-hosted vendor libraries
├── scripts/
│   ├── build-assets.js                # Offline asset builder & TopoJSON extraction
│   └── tailwind.css                   # Tailwind source definitions
├── tests/
│   └── ui.spec.js                     # 12-test Playwright E2E verification suite
├── playwright.config.js               # Test runner configuration
├── server.js                          # Express.js backend & API dispatcher
├── vercel.json                        # Vercel serverless routing definition
└── .vercelignore                      # Deployment bundle optimizer
```

---

## ⚖️ Ethics & Research Disclaimer

> [!IMPORTANT]
> **Educational & Threat Research Use Only:**  
> This platform is developed strictly for authorized security auditing, defensive cyber threat intelligence (CTI), and academic forensic analysis. Attribution scores generated by the stylometry engine represent probabilistic statistical correlations and must be corroborated with verifiable technical indicators (IOCs) before forensic conclusions are drawn.

---

<div align="center">

Made with 🛡️ by [Swayam Yadav](https://github.com/Swayamyadav01) & Contributors

</div>
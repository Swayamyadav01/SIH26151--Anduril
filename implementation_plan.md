# Updated Implementation Plan: Targeted Dark Web Operator & User De-Anonymization Platform (PSID: 26151)

An end-to-end investigative platform specifically built to unmask **(1) the person controlling a dark web site (Site Admin/Operator)** and **(2) targeted users/threat actors operating on those sites**.

---

## 1. Targeted De-Anonymization Methodology

```
                                    ┌─────────────────────────────────────────┐
                                    │      INVESTIGATION TARGET INPUT         │
                                    │  [Target Onion Site] OR [Target User]   │
                                    └────────────────────┬────────────────────┘
                                                         │
                        ┌────────────────────────────────┴────────────────────────────────┐
                        ▼                                                                 ▼
      ┌───────────────────────────────────┐                             ┌───────────────────────────────────┐
      │  TRACK 1: SITE OPERATOR UNMASKING │                             │  TRACK 2: TARGETED USER UNMASKING │
      │  (Infrastructure & Admin Origin)  │                             │  (Persona & Digital Footprint)    │
      └─────────────────┬─────────────────┘                             └─────────────────┬─────────────────┘
                        │                                                                 │
  ┌─────────────────────┴─────────────────────┐                     ┌─────────────────────┴─────────────────────┐
  │ • Exposed Status & ServerName Leaks       │                     │ • Multi-Platform Handle Fusion            │
  │ • SSL Cert & SAN Clearnet Match           │                     │ • PGP Key Fingerprint & Email Correlations│
  │ • ETag Inode & JARM TLS Fingerprinting    │                     │ • Crypto Wallet Exchange Tracing (BTC/XMR)│
  │ • SSH Host Key Re-use Detection           │                     │ • EXIF Metadata & Document Forensics      │
  │ • Clearnet Origin IP & ISP Attribution    │                     │ • AI Stylometric Persona & Timezone Match │
  └─────────────────────┬─────────────────────┘                     └─────────────────────┬─────────────────────┘
                        │                                                                 │
                        └────────────────────────────────┬────────────────────────────────┘
                                                         ▼
                                ┌─────────────────────────────────────────────────┐
                                │   ATTRIBUTION GRAPH & CASE DOSSIER GENERATOR    │
                                │  - Direct Evidence Chain & Link Analysis        │
                                │  - Attribution Confidence Score (0 - 100%)      │
                                │  - Export Forensic Case Brief (PDF, JSON, CSV)  │
                                └─────────────────────────────────────────────────┘
```

---

## 2. Targeted System Modules

### Module 1: Targeted Operator Investigation Engine (Unmasking Website Controllers)
- **Target Input**: Enter any `.onion` v3 address.
- **Deep Technical Audit**:
  - **Server-Status & VHost Leaks**: Detect exposed Apache/Nginx status pages leaking real client connection IP tables and internal server names.
  - **TLS/SSL Cert Correlation**: Extract TLS serial numbers and SANs (Subject Alternative Names) matching clearnet domain certificates.
  - **JARM & Favicon Hashing**: Compute JARM TLS signatures and MMH3 favicon hashes to match against clearnet Shodan/Censys indices.
  - **ETag & Header Inode Analysis**: Calculate origin server creation timestamps and file inodes from HTTP headers.
  - **SSH Host Key Correlation**: Compare OpenSSH public keys against clearnet IPv4 space to identify co-located servers.
- **Result**: Pinpoints the exact **Clearnet Origin IP**, Hosting Provider, Country, and ISP controlling the target site.

### Module 2: Targeted User & Persona Unmasking Engine (Unmasking Specific Users)
- **Target Input**: Enter a user handle, alias, PGP key, or crypto wallet address.
- **Identity Fusion Graph**:
  - Aggregates user activities across BreachForums, Dread, XSS, Exploit.in, Telegram channels, and legacy darknet markets.
  - Connects aliases, PGP fingerprints, Jabber/Telegram IDs, and past breach leaks into a single entity node.
- **Financial & Crypto Tracing**:
  - Analyzes Bitcoin / Monero wallet history linked to the target user.
  - Identifies deposits/withdrawals tied to KYC-compliant exchanges or clearnet payment gateways.
- **AI Stylometric & Behavioral Profiler**:
  - **Writing Fingerprint**: Compares sentence length, punctuation habits (custom separators like `::`, quotes `« »`), vocabulary richness, and syntax habits against clearnet profiles (Reddit, Twitter/X, GitHub, clearnet forums).
  - **Active Time-Zone Wheel**: Plots timestamp distribution across 24 hours to deduce the user's primary operating time zone and sleeping schedule.
- **Result**: Uncovers the real-world identity, social profiles, email accounts, and suspect location of the targeted user.

### Module 3: Case Workspace & Evidence Dossier
- **Interactive Link Visualizer**: Renders the complete evidence chain connecting the target (Site/User) $\rightarrow$ Identifiers $\rightarrow$ Infrastructure Leaks $\rightarrow$ Clearnet IP / Real Person.
- **Attribution Confidence Meter**: Multi-factor scoring algorithm weighing technical leaks, PGP verification, crypto links, and stylometric similarity.
- **Forensic Report Exporter**: One-click generation of court-ready forensic reports in PDF, JSON, and CSV formats with evidence audit trails.

---

## 3. Technology Stack & Implementation Architecture

- **Backend**: Node.js & Express API serving targeted search, graph building, stylometry matching, and infrastructure scanner modules.
- **Data Engine**: Structured darkweb threat actor profiles, onion infrastructure indicators, and writing style corpora.
- **Frontend**: High-contrast Cyberpunk Tactical UI built with HTML5, CSS3, Vis-Network (interactive relationship graph), and Chart.js (timezone wheel & stylometric radar).

---

## 4. Verification & Testing Plan

1. **Operator Unmasking Verification**:
   - Input target hidden service (`intelbrk83jdhx7923hskduw73jsndk29shdu39s.onion`).
   - Verify scanner identifies exposed `/server-status` leak, SSL cert SAN match, and attributes origin IP `185.220.101.45` (PrivateLayer Romania) with 96.8% confidence.
2. **Targeted User Unmasking Verification**:
   - Search target handle (`IntelBroker` or `USDoD`).
   - Inspect cross-platform aliases, PGP key fingerprints, crypto wallets, and linked suspect identity (`Kai V. Larson` / `Luan G.`).
3. **AI Stylometry & Timezone Verification**:
   - Run sample writing text through AI Stylometry engine.
   - Verify feature matching breakdown, persona ranking, and timezone activity wheel.
4. **Report Export Verification**:
   - Generate and download CSV, JSON, and printable forensic PDF intelligence brief.

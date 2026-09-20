
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = window.location.port === '3000' ? '' : 'http://localhost:3000';
    let allData = null;

    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('i');
    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.add('light-mode');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
    themeToggleBtn.addEventListener('click', () => {
        const isLight = document.documentElement.classList.toggle('light-mode');
        if (isLight) {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    });

    // 4 Clean Tabs Navigation
    const tabs = document.querySelectorAll('.workspace-tabs .tab');
    const workspaces = document.querySelectorAll('.main-workspace');

    function switchTab(tabId) {
        tabs.forEach(t => {
            if (t.getAttribute('data-tab') === tabId) {
                t.classList.add('active');
            } else {
                t.classList.remove('active');
            }
        });

        workspaces.forEach(w => {
            if (w.id === tabId) {
                w.style.display = 'block';
            } else {
                w.style.display = 'none';
            }
        });
        if (tabId === 'tab-website' && allData && allData.website_targets) {
            renderWebsiteInvestigation(document.getElementById('web-target-select').value);
        }
    }

    tabs.forEach(t => {
        t.addEventListener('click', () => switchTab(t.getAttribute('data-tab')));
    });

    document.getElementById('btn-goto-web-card').addEventListener('click', () => switchTab('tab-website'));
    document.getElementById('btn-goto-user-card').addEventListener('click', () => switchTab('tab-user'));

    // Generic Graph Renderer (Used independently for Server Map vs User Map)
    function renderMap(container, inspector, mapData) {
        container.innerHTML = '';
        inspector.innerHTML = '<span class="muted-text text-sm">Click any node on the map to see its details.</span>';

        if (!mapData || !mapData.nodes) return;

        mapData.edges.forEach(e => {
            const n1 = mapData.nodes.find(n => n.id === e[0]);
            const n2 = mapData.nodes.find(n => n.id === e[1]);
            if (!n1 || !n2) return;
            const line = document.createElement('div');
            line.className = 'mock-line';
            const dx = n2.x - n1.x, dy = n2.y - n1.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            line.style.width = `${length}%`;
            line.style.height = '1px';
            line.style.left = `${n1.x}%`;
            line.style.top = `${n1.y}%`;
            line.style.transform = `rotate(${angle}deg)`;
            container.appendChild(line);
        });

        mapData.nodes.forEach(n => {
            const node = document.createElement('div');
            node.className = `mock-node type-${n.type}`;
            node.style.left = `${n.x}%`;
            node.style.top = `${n.y}%`;
            node.title = n.label;
            node.addEventListener('click', () => {
                inspector.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px; font-family:var(--font-mono)">
                        <strong style="color:var(--accent-blue)">${n.label}</strong>
                        <span style="color:var(--text-muted)">//</span>
                        <span>${n.meta || ''}</span>
                        ${n.asn ? `<span style="color:var(--accent-amber)">[${n.asn}]</span>` : ''}
                    </div>
                `;
            });
            container.appendChild(node);
        });
    }

    // ==================== TAB 1: OVERVIEW ====================
    function renderOverview() {
        const ov = allData.overview;
        if (!ov) return;
        document.getElementById('stat-sites').textContent = ov.stats.monitored_sites;
        document.getElementById('stat-ips').textContent = ov.stats.found_server_ips;
        document.getElementById('stat-persons').textContent = ov.stats.identified_persons;

        const tbody = document.getElementById('overview-recent-table');
        tbody.innerHTML = '';
        ov.recent_discoveries.forEach(row => {
            const tr = document.createElement('tr');
            const isWeb = row.type === 'website';
            tr.innerHTML = `
                <td><span class="threat-chip ${isWeb ? 'high' : 'critical'}">${isWeb ? 'WEBSITE' : 'USER'}</span></td>
                <td style="font-weight:600">${row.target}</td>
                <td style="font-family:var(--font-mono); font-weight:600; color:${isWeb ? 'var(--accent-amber)' : 'var(--accent-green)'}">${row.result}</td>
                <td style="color:var(--text-muted)">${row.method}</td>
                <td>
                    <button class="btn-secondary" style="padding:4px 8px; font-size:11px" data-target="${row.input_val}" data-type="${row.type}">
                        <i class="fa-solid fa-arrow-right"></i> Open
                    </button>
                </td>
            `;
            const btn = tr.querySelector('button');
            btn.addEventListener('click', () => {
                if (row.type === 'website') {
                    document.getElementById('web-target-select').value = row.input_val;
                    switchTab('tab-website');
                    renderWebsiteInvestigation(row.input_val);
                } else {
                    document.getElementById('user-target-select').value = row.input_val;
                    switchTab('tab-user');
                    renderUserInvestigation(row.input_val);
                }
            });
            tbody.appendChild(tr);
        });
    }

        // ==================== TAB 2: INVESTIGATE WEBSITE (TRACK 1) ====================
    const webTargetSelect = document.getElementById('web-target-select');
    const btnRunWebScan = document.getElementById('btn-run-web-scan');
    const webResOnion = document.getElementById('web-res-onion');
    const webResIp = document.getElementById('web-res-ip');
    const webResLoc = document.getElementById('web-res-loc');
    const webResHost = document.getElementById('web-res-host');
    const webLeaksCount = document.getElementById('web-leaks-count');
    const webLeaksList = document.getElementById('web-leaks-list');
    const webCanvas = document.getElementById('web-canvas');
    const webInspector = document.getElementById('web-inspector');

    function renderWebsiteInvestigation(onionKey) {
        const site = allData.website_targets[onionKey];
        if (!site) return;

        webResOnion.textContent = site.onion_address.length > 24 ? `${site.onion_address.slice(0, 20)}...onion` : site.onion_address;
        webResIp.textContent = site.server_ip;
        webResLoc.innerHTML = `<i class="fa-solid fa-location-dot text-amber"></i> ${site.country}`;
        webResHost.textContent = site.hosting_provider;

        if (site.status === 'SERVER_UNMASKED') {
            document.getElementById('web-res-ip-chip').style.borderColor = 'var(--accent-amber)';
            document.getElementById('web-res-ip-chip').style.color = 'var(--accent-amber)';
            if (webLeaksCount) webLeaksCount.textContent = `${site.leaks.length} Server Leaks Found`;
            webLeaksList.innerHTML = '';
            site.leaks.forEach(l => {
                const card = document.createElement('div');
                card.className = `leak-item-card ${l.severity.toLowerCase()}`;
                card.innerHTML = `
                    <div class="leak-item-top">
                        <span class="leak-title">${l.leak_name}</span>
                        <span class="threat-chip ${l.severity.toLowerCase()}">${l.severity}</span>
                    </div>
                    <div class="leak-desc">${l.details}</div>
                    <div class="leak-proof">Technical Proof: ${l.technical_proof}</div>
                `;
                webLeaksList.appendChild(card);
            });
        } else {
            document.getElementById('web-res-ip-chip').style.borderColor = 'var(--border-color)';
            document.getElementById('web-res-ip-chip').style.color = 'var(--text-muted)';
            if (webLeaksCount) webLeaksCount.textContent = '0 Leaks (Protected)';
            webLeaksList.innerHTML = `
                <div style="padding:30px; text-align:center; color:var(--text-muted)">
                    <i class="fa-solid fa-shield-check text-green" style="font-size:32px; margin-bottom:8px; display:block"></i>
                    <strong>No Server Leaks Found</strong>
                    <p style="font-size:11.5px; margin-top:4px">This website is properly configured behind Tor. Its real server IP is safely hidden.</p>
                </div>
            `;
        }

        renderMap(webCanvas, webInspector, site.server_map);
    }

    async function executeLivePassiveAudit(onionKey) {
        btnRunWebScan.disabled = true;
        btnRunWebScan.innerHTML = '<i class="fa-solid fa-satellite-dish fa-spin"></i> Querying Shodan, FOFA &amp; Censys Dorks...';

        try {
            const res = await fetch(`${API_BASE}/api/audit/passive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ onion_address: onionKey })
            });

            if (res.ok) {
                const auditData = await res.json();
                console.log('Passive audit orchestrated response:', auditData);

                if (auditData.origin_unmasked) {
                    webResIp.textContent = auditData.origin_ip;
                    webResHost.textContent = auditData.hosting_provider;
                    webResLoc.innerHTML = `<i class="fa-solid fa-location-dot text-amber"></i> ${auditData.location}`;
                    document.getElementById('web-res-ip-chip').style.borderColor = 'var(--accent-amber)';
                    document.getElementById('web-res-ip-chip').style.color = 'var(--accent-amber)';

                    if (auditData.forensic_evidence && auditData.forensic_evidence.length > 0) {
                        if (webLeaksCount) webLeaksCount.textContent = `${auditData.forensic_evidence.length} Server Leaks Unmasked (${auditData.confidence_score}% Confidence)`;
                        webLeaksList.innerHTML = '';
                        auditData.forensic_evidence.forEach(ev => {
                            const card = document.createElement('div');
                            const sev = (ev.severity || 'info').toLowerCase();
                            card.className = `leak-item-card ${sev}`;
                            card.innerHTML = `
                                <div class="leak-item-top">
                                    <span class="leak-title">${ev.title}</span>
                                    <span class="threat-chip ${sev}">${ev.severity}</span>
                                </div>
                                <div class="leak-desc">${ev.description}</div>
                                <div class="leak-proof">Corroborated via passive Shodan, FOFA &amp; Censys queries</div>
                            `;
                            webLeaksList.appendChild(card);
                        });
                    }
                } else {
                    webResIp.textContent = 'Hidden behind Tor (No IP Leaked)';
                    webResHost.textContent = 'Tor Onion Routing Circuit';
                    webResLoc.innerHTML = `<i class="fa-solid fa-shield-check text-green"></i> Fully Protected`;
                    document.getElementById('web-res-ip-chip').style.borderColor = 'var(--border-color)';
                    document.getElementById('web-res-ip-chip').style.color = 'var(--text-muted)';
                    if (webLeaksCount) webLeaksCount.textContent = '0 Leaks (Properly Configured)';
                    webLeaksList.innerHTML = `
                        <div style="padding:35px 20px; text-align:center; color:var(--text-muted)">
                            <i class="fa-solid fa-shield-halved text-green" style="font-size:36px; margin-bottom:10px; display:block"></i>
                            <strong style="color:var(--text-bright); font-size:14px">Zero Passive Leaks Detected</strong>
                            <p style="font-size:12px; margin-top:6px; max-width:440px; margin-left:auto; margin-right:auto; line-height:1.5">
                                Search dorks executed across Shodan, FOFA, and Censys discovered zero exposed SSL certificates, status scoreboards, unique headers, or host keys. This hidden service is securely isolated.
                            </p>
                        </div>
                    `;
                }
            } else {
                renderWebsiteInvestigation(onionKey);
            }
        } catch (err) {
            console.warn('Backend audit request fallback to local model:', err);
            renderWebsiteInvestigation(onionKey);
        } finally {
            btnRunWebScan.disabled = false;
            btnRunWebScan.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Check Server Leaks';
        }
    }

    btnRunWebScan.addEventListener('click', () => {
        executeLivePassiveAudit(webTargetSelect.value);
    });

    webTargetSelect.addEventListener('change', (e) => renderWebsiteInvestigation(e.target.value));

    // ==================== TAB 3: INVESTIGATE USER (TRACK 2) ====================
    const userTargetSelect = document.getElementById('user-target-select');
    const btnRunUserAnalysis = document.getElementById('btn-run-user-analysis');
    const userResHandle = document.getElementById('user-res-handle');
    const userResName = document.getElementById('user-res-name');
    const userResLoc = document.getElementById('user-res-loc');
    const userResMatch = document.getElementById('user-res-match');
    const userDetailsContainer = document.getElementById('user-details-container');
    const userCanvas = document.getElementById('user-canvas');
    const userInspector = document.getElementById('user-inspector');

    function renderUserInvestigation(username) {
        const user = allData.user_targets[username];
        if (!user) return;

        userResHandle.textContent = user.username;
        userResName.innerHTML = `<i class="fa-solid fa-user-check"></i> ${user.suspected_name}`;
        userResLoc.innerHTML = `<i class="fa-solid fa-earth-americas text-blue"></i> ${user.suspected_location}`;
        userResMatch.textContent = user.writing_match;

        userDetailsContainer.innerHTML = `
            <div class="detail-section">
                <span class="sec-title">Connected Dark Web Forum Accounts</span>
                <div class="accounts-chip-grid">
                    ${user.accounts.map(a => `
                        <div class="acc-chip">
                            <i class="fa-solid fa-globe text-blue"></i>
                            <span>${a.platform}:</span>
                            <strong>${a.handle}</strong>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="detail-section">
                <span class="sec-title">Digital Signature (PGP Public Key)</span>
                <div class="info-chip-box"><i class="fa-solid fa-key text-amber"></i> ${user.pgp_key}</div>
            </div>

            <div class="detail-section">
                <span class="sec-title">Payment Wallet Tracing (Crypto)</span>
                <div class="info-chip-box"><i class="fa-solid fa-wallet text-green"></i> ${user.crypto_wallet}</div>
            </div>

            <div class="detail-section">
                <span class="sec-title">Writing Style & Active Hours (AI Analysis)</span>
                <div class="style-box">
                    <p style="margin-bottom:4px"><strong>Active Schedule:</strong> ${user.active_hours}</p>
                    <p><strong>Writing Traits:</strong> ${user.writing_style}</p>
                </div>
            </div>
        `;

        renderMap(userCanvas, userInspector, user.user_map);
    }

    btnRunUserAnalysis.addEventListener('click', () => {
        btnRunUserAnalysis.disabled = true;
        btnRunUserAnalysis.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing Footprints...';
        setTimeout(() => {
            renderUserInvestigation(userTargetSelect.value);
            btnRunUserAnalysis.disabled = false;
            btnRunUserAnalysis.innerHTML = '<i class="fa-solid fa-user-check"></i> Analyze Digital Footprint';
        }, 600);
    });

    userTargetSelect.addEventListener('change', (e) => renderUserInvestigation(e.target.value));

    // ==================== TAB 4: REPORTS & MODAL ====================
    const reportModal = document.getElementById('report-modal');
    const modalReportTitle = document.getElementById('modal-report-title');
    const modalReportBody = document.getElementById('modal-report-body');
    const btnCloseRepModal = document.getElementById('btn-close-rep-modal');
    const btnCancelRepModal = document.getElementById('btn-cancel-rep-modal');

    function openReport(title, contentHtml) {
        modalReportTitle.innerHTML = title;
        modalReportBody.innerHTML = contentHtml;
        reportModal.style.display = 'flex';
    }

    btnCloseRepModal.addEventListener('click', () => reportModal.style.display = 'none');
    btnCancelRepModal.addEventListener('click', () => reportModal.style.display = 'none');

    document.getElementById('btn-print-web-report').addEventListener('click', () => {
        const site = allData.website_targets['intelbrk83jdhx7923hskduw73jsndk29shdu39s.onion'];
        openReport('<i class="fa-solid fa-globe text-blue"></i> Website Server Finding Report', `
            <div class="doc-box">
                <p><strong>Target Website (.onion):</strong> ${site.onion_address}</p>
                <p><strong>Discovered Real Server IP:</strong> <span style="color:var(--accent-amber); font-weight:700">${site.server_ip}</span></p>
                <p><strong>Hosting Company & ASN:</strong> ${site.hosting_provider}</p>
                <p><strong>Server Physical Location:</strong> ${site.country}</p>
            </div>
            <h4 style="margin-top:8px">Technical Leaks Discovered:</h4>
            ${site.leaks.map(l => `<p>• <strong>${l.leak_name} (${l.severity}):</strong> ${l.details}</p>`).join('')}
            <p style="font-size:10px; color:var(--text-dim); margin-top:12px">EVIDENTIARY REPORT GENERATED UNDER PSID: 26151. AUTHORIZED USE ONLY.</p>
        `);
    });

    document.getElementById('btn-print-user-report').addEventListener('click', () => {
        const user = allData.user_targets['IntelBroker'];
        openReport('<i class="fa-solid fa-user-ninja text-green"></i> User Identity Finding Report', `
            <div class="doc-box">
                <p><strong>Dark Web Username:</strong> ${user.username}</p>
                <p><strong>Suspected Real-World Person:</strong> <span style="color:var(--accent-green); font-weight:700">${user.suspected_name}</span></p>
                <p><strong>Suspected Location:</strong> ${user.suspected_location}</p>
                <p><strong>Writing Style Match Score:</strong> ${user.writing_match}</p>
                <p><strong>Active Schedule:</strong> ${user.active_hours}</p>
            </div>
            <h4 style="margin-top:8px">Connected Digital Accounts:</h4>
            ${user.accounts.map(a => `<p>• ${a.platform}: <strong>${a.handle}</strong> (${a.status})</p>`).join('')}
            <p style="margin-top:6px">• <strong>Crypto Trace:</strong> ${user.crypto_wallet}</p>
            <p style="font-size:10px; color:var(--text-dim); margin-top:12px">EVIDENTIARY REPORT GENERATED UNDER PSID: 26151. AUTHORIZED USE ONLY.</p>
        `);
    });

    document.getElementById('btn-dl-web-json').addEventListener('click', () => {
        const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData.website_targets, null, 2));
        const a = document.createElement('a'); a.href = jsonStr; a.download = "Website_Server_Deanon_Report.json";
        document.body.appendChild(a); a.click(); a.remove();
    });

    document.getElementById('btn-dl-user-json').addEventListener('click', () => {
        const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData.user_targets, null, 2));
        const a = document.createElement('a'); a.href = jsonStr; a.download = "User_Identity_Deanon_Report.json";
        document.body.appendChild(a); a.click(); a.remove();
    });

    // Initial load
    async function init() {
        try {
            const res = await fetch('data.json');
            allData = await res.json();
            renderOverview();
            renderWebsiteInvestigation('intelbrk83jdhx7923hskduw73jsndk29shdu39s.onion');
            renderUserInvestigation('IntelBroker');
        } catch (e) {
            console.error('Failed to load data:', e);
        }
    }

    init();
});

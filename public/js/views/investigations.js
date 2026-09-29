function renderInvestigations(container) {
    const actors = appState.data.actors || [];

    // ---------- generate realistic investigation entries ----------
    const templates = [
        { title: 'Infrastructure Attribution', risk: 'High', confidence: 87, status: 'Active', evidenceTypes: ['IP Geolocation', 'SSL Certificate Match', 'Server Header Correlation'] },
        { title: 'Cross-Platform Correlation', risk: 'Medium', confidence: 62, status: 'Active', evidenceTypes: ['Username Reuse', 'PGP Key Match', 'Stylometric Match'] },
        { title: 'Wallet Cluster Analysis', risk: 'High', confidence: 74, status: 'Pending Review', evidenceTypes: ['Wallet Correlation', 'Transaction Graph', 'Exchange KYC Leak'] },
        { title: 'Operational Security Failures', risk: 'High', confidence: 91, status: 'Active', evidenceTypes: ['DNS Leak', 'Clearnet Exposure', 'Metadata Extraction'] },
        { title: 'Linguistic Fingerprinting', risk: 'Medium', confidence: 55, status: 'Pending Review', evidenceTypes: ['Stylometric Match', 'Timezone Analysis', 'Language Pattern'] },
        { title: 'Supply Chain Network Mapping', risk: 'Low', confidence: 38, status: 'Closed', evidenceTypes: ['Forum Post Correlation', 'Marketplace Review Link', 'PGP Match'] },
        { title: 'Ransomware Payment Tracing', risk: 'High', confidence: 82, status: 'Active', evidenceTypes: ['Wallet Correlation', 'Mixer De-obfuscation', 'Exchange Deposit Match'] },
        { title: 'Alias De-anonymization', risk: 'Medium', confidence: 68, status: 'Pending Review', evidenceTypes: ['Email Correlation', 'PGP Key Match', 'Registration Timestamp'] },
        { title: 'C2 Infrastructure Pivot', risk: 'High', confidence: 79, status: 'Active', evidenceTypes: ['IP Geolocation', 'Domain WHOIS', 'Passive DNS'] },
        { title: 'Data Breach Attribution', risk: 'Medium', confidence: 45, status: 'Closed', evidenceTypes: ['Stylometric Match', 'Paste Site Correlation', 'Forum Activity'] },
    ];

    const investigations = templates.map((tpl, i) => {
        const actor = actors[i % actors.length] || { name: `Actor-${i}`, id: `actor-${i}` };
        const daysAgo = Math.floor(Math.random() * 60) + 1;
        const updatedAgo = Math.floor(Math.random() * daysAgo);
        const created = new Date(Date.now() - daysAgo * 86400000);
        const updated = new Date(Date.now() - updatedAgo * 86400000);
        return {
            id: `INV-${String(i + 1).padStart(3, '0')}`,
            title: `${actor.name || actor.handle || 'Unknown'} ${tpl.title}`,
            actorName: actor.name || actor.handle || 'Unknown',
            actorId: actor.id,
            risk: tpl.risk,
            confidence: tpl.confidence,
            status: tpl.status,
            evidenceTypes: tpl.evidenceTypes,
            created: created.toISOString().split('T')[0],
            updated: updated.toISOString().split('T')[0],
        };
    });

    const counts = {
        total: investigations.length,
        active: investigations.filter(i => i.status === 'Active').length,
        pending: investigations.filter(i => i.status === 'Pending Review').length,
        closed: investigations.filter(i => i.status === 'Closed').length,
    };

    // ---------- render page ----------
    container.innerHTML = `
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                    <i class="fa-solid fa-magnifying-glass-chart mr-3 text-primary"></i> Investigations
                </h2>
                <p class="text-sm text-text-muted mt-1">Track, correlate, and manage active threat-actor investigations.</p>
            </div>
            <button id="btnNewInvestigation" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
                <i class="fa-solid fa-plus mr-2"></i>New Investigation
            </button>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-surface rounded-xl p-4 shadow-sm border border-border-color">
                <div class="flex items-center text-primary mb-2">
                    <i class="fa-solid fa-folder-open bg-primary-light p-2 rounded-lg text-sm mr-2"></i>
                    <span class="text-xs font-semibold text-gray-500 uppercase">Total Investigations</span>
                </div>
                <div class="text-2xl font-bold text-gray-800">${counts.total}</div>
                <div class="text-xs text-success mt-1"><i class="fa-solid fa-arrow-up mr-1"></i>3 this month</div>
            </div>
            <div class="bg-surface rounded-xl p-4 shadow-sm border border-border-color">
                <div class="flex items-center text-green-600 mb-2">
                    <i class="fa-solid fa-spinner bg-green-50 p-2 rounded-lg text-sm mr-2"></i>
                    <span class="text-xs font-semibold text-gray-500 uppercase">Active</span>
                </div>
                <div class="text-2xl font-bold text-gray-800">${counts.active}</div>
                <div class="text-xs text-green-600 mt-1"><i class="fa-solid fa-circle text-[6px] mr-1 align-middle"></i>In progress</div>
            </div>
            <div class="bg-surface rounded-xl p-4 shadow-sm border border-border-color">
                <div class="flex items-center text-amber-500 mb-2">
                    <i class="fa-solid fa-clock bg-amber-50 p-2 rounded-lg text-sm mr-2"></i>
                    <span class="text-xs font-semibold text-gray-500 uppercase">Pending Review</span>
                </div>
                <div class="text-2xl font-bold text-gray-800">${counts.pending}</div>
                <div class="text-xs text-amber-500 mt-1"><i class="fa-solid fa-hourglass-half mr-1"></i>Awaiting analyst</div>
            </div>
            <div class="bg-surface rounded-xl p-4 shadow-sm border border-border-color">
                <div class="flex items-center text-gray-400 mb-2">
                    <i class="fa-solid fa-box-archive bg-gray-100 p-2 rounded-lg text-sm mr-2"></i>
                    <span class="text-xs font-semibold text-gray-500 uppercase">Closed</span>
                </div>
                <div class="text-2xl font-bold text-gray-800">${counts.closed}</div>
                <div class="text-xs text-gray-400 mt-1"><i class="fa-solid fa-check mr-1"></i>Resolved</div>
            </div>
        </div>

        <!-- Filter Bar -->
        <div class="bg-surface rounded-xl p-4 shadow-sm border border-border-color mb-6 flex flex-wrap items-center gap-3">
            <div class="flex items-center gap-2">
                <label class="text-xs font-semibold text-gray-500 uppercase">Status</label>
                <select id="invFilterStatus" class="text-sm border border-border-color rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Closed">Closed</option>
                </select>
            </div>
            <div class="flex items-center gap-2">
                <label class="text-xs font-semibold text-gray-500 uppercase">Risk</label>
                <select id="invFilterRisk" class="text-sm border border-border-color rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40">
                    <option value="All">All</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>
            <div class="flex-1 min-w-[200px]">
                <div class="relative">
                    <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                    <input id="invSearch" type="text" placeholder="Search investigations…" class="w-full pl-9 pr-3 py-1.5 text-sm border border-border-color rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
            </div>
        </div>

        <!-- Investigations Table -->
        <div class="bg-surface rounded-xl shadow-sm border border-border-color overflow-hidden mb-6">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th class="px-4 py-3">ID</th>
                            <th class="px-4 py-3">Title</th>
                            <th class="px-4 py-3">Target Persona</th>
                            <th class="px-4 py-3">Risk</th>
                            <th class="px-4 py-3 min-w-[140px]">Confidence</th>
                            <th class="px-4 py-3">Status</th>
                            <th class="px-4 py-3">Created</th>
                            <th class="px-4 py-3">Last Updated</th>
                            <th class="px-4 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="invTableBody"></tbody>
                </table>
            </div>
        </div>

        <!-- Detail Panel (injected dynamically) -->
        <div id="invDetailPanel"></div>
    `;

    // ---------- helpers ----------
    const riskDot = (risk) => {
        const colors = { High: 'bg-red-500', Medium: 'bg-amber-400', Low: 'bg-green-500' };
        return `<span class="inline-flex items-center gap-1.5"><span class="w-2 h-2 rounded-full ${colors[risk] || 'bg-gray-400'}"></span>${risk}</span>`;
    };

    const statusBadge = (status) => {
        const map = {
            'Active': 'bg-green-100 text-green-700',
            'Pending Review': 'bg-amber-100 text-amber-700',
            'Closed': 'bg-gray-100 text-gray-500',
        };
        return `<span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-500'}">${status}</span>`;
    };

    const confidenceBar = (pct) => {
        const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
        return `
            <div class="flex items-center gap-2">
                <div class="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div class="${color} h-full rounded-full" style="width:${pct}%"></div>
                </div>
                <span class="text-xs font-medium text-gray-600 w-9 text-right">${pct}%</span>
            </div>`;
    };

    // ---------- render table rows ----------
    function renderRows(filter) {
        const tbody = document.getElementById('invTableBody');
        if (!tbody) return;

        let filtered = investigations;
        if (filter && filter.status && filter.status !== 'All') {
            filtered = filtered.filter(inv => inv.status === filter.status);
        }
        if (filter && filter.risk && filter.risk !== 'All') {
            filtered = filtered.filter(inv => inv.risk === filter.risk);
        }
        if (filter && filter.search) {
            const q = filter.search.toLowerCase();
            filtered = filtered.filter(inv =>
                inv.id.toLowerCase().includes(q) ||
                inv.title.toLowerCase().includes(q) ||
                inv.actorName.toLowerCase().includes(q)
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="px-4 py-10 text-center text-gray-400"><i class="fa-solid fa-inbox text-3xl mb-2 block"></i>No investigations match the current filters.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(inv => `
            <tr class="border-t border-border-color hover:bg-gray-50/60 transition-colors">
                <td class="px-4 py-3 font-mono text-xs text-primary font-semibold">${inv.id}</td>
                <td class="px-4 py-3 font-medium text-gray-800">${inv.title}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex items-center gap-1.5 text-primary cursor-pointer hover:underline" data-actor-id="${inv.actorId}">
                        <i class="fa-solid fa-user-secret text-xs"></i>${inv.actorName}
                    </span>
                </td>
                <td class="px-4 py-3">${riskDot(inv.risk)}</td>
                <td class="px-4 py-3">${confidenceBar(inv.confidence)}</td>
                <td class="px-4 py-3">${statusBadge(inv.status)}</td>
                <td class="px-4 py-3 text-xs text-gray-500">${inv.created}</td>
                <td class="px-4 py-3 text-xs text-gray-500">${inv.updated}</td>
                <td class="px-4 py-3 text-right">
                    <button class="inv-view text-primary hover:text-primary-dark text-xs font-medium mr-2" data-inv-id="${inv.id}"><i class="fa-solid fa-eye mr-1"></i>View</button>
                    <button class="inv-archive text-gray-400 hover:text-gray-600 text-xs font-medium" data-inv-id="${inv.id}"><i class="fa-solid fa-box-archive mr-1"></i>Archive</button>
                </td>
            </tr>
        `).join('');

        // View buttons
        tbody.querySelectorAll('.inv-view').forEach(btn => {
            btn.addEventListener('click', () => showDetail(btn.dataset.invId));
        });
        // Archive buttons
        tbody.querySelectorAll('.inv-archive').forEach(btn => {
            btn.addEventListener('click', () => {
                const row = btn.closest('tr');
                if (row) row.style.opacity = '0.4';
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-check mr-1"></i>Archived';
            });
        });
    }

    // initial render
    renderRows({});

    // ---------- filter listeners ----------
    const getFilters = () => ({
        status: document.getElementById('invFilterStatus')?.value || 'All',
        risk: document.getElementById('invFilterRisk')?.value || 'All',
        search: document.getElementById('invSearch')?.value || '',
    });

    document.getElementById('invFilterStatus')?.addEventListener('change', () => renderRows(getFilters()));
    document.getElementById('invFilterRisk')?.addEventListener('change', () => renderRows(getFilters()));
    document.getElementById('invSearch')?.addEventListener('input', () => renderRows(getFilters()));

    // ---------- detail panel ----------
    function showDetail(invId) {
        const inv = investigations.find(i => i.id === invId);
        if (!inv) return;

        const panel = document.getElementById('invDetailPanel');
        if (!panel) return;

        // Evidence entries
        const evidenceIcons = {
            'PGP Key Match': 'fa-key', 'PGP Match': 'fa-key', 'Wallet Correlation': 'fa-coins',
            'Stylometric Match': 'fa-pen-nib', 'IP Geolocation': 'fa-map-marker-alt',
            'SSL Certificate Match': 'fa-certificate', 'Server Header Correlation': 'fa-server',
            'Username Reuse': 'fa-at', 'Transaction Graph': 'fa-diagram-project',
            'Exchange KYC Leak': 'fa-id-card', 'DNS Leak': 'fa-globe', 'Clearnet Exposure': 'fa-eye',
            'Metadata Extraction': 'fa-file-lines', 'Timezone Analysis': 'fa-clock',
            'Language Pattern': 'fa-language', 'Forum Post Correlation': 'fa-comments',
            'Marketplace Review Link': 'fa-store', 'Mixer De-obfuscation': 'fa-shuffle',
            'Exchange Deposit Match': 'fa-building-columns', 'Email Correlation': 'fa-envelope',
            'Registration Timestamp': 'fa-calendar-check', 'Domain WHOIS': 'fa-address-card',
            'Passive DNS': 'fa-network-wired', 'Paste Site Correlation': 'fa-paste',
            'Forum Activity': 'fa-message',
        };

        const evidenceConfidences = inv.evidenceTypes.map(() => Math.floor(Math.random() * 30) + 65);

        const timelineEvents = [
            { date: inv.created, event: 'Investigation opened', icon: 'fa-flag', color: 'text-primary' },
            { date: inv.created, event: `Initial lead from ${inv.evidenceTypes[0]}`, icon: 'fa-lightbulb', color: 'text-amber-500' },
            { date: new Date(new Date(inv.created).getTime() + 5 * 86400000).toISOString().split('T')[0], event: `${inv.evidenceTypes[1] || inv.evidenceTypes[0]} evidence collected`, icon: 'fa-file-circle-plus', color: 'text-green-600' },
            { date: inv.updated, event: inv.status === 'Closed' ? 'Investigation closed' : 'Analyst review updated', icon: inv.status === 'Closed' ? 'fa-check-circle' : 'fa-pen-to-square', color: inv.status === 'Closed' ? 'text-gray-400' : 'text-primary' },
        ];

        const riskColors = { High: 'red', Medium: 'amber', Low: 'green' };
        const rc = riskColors[inv.risk] || 'gray';

        panel.innerHTML = `
            <div class="bg-surface rounded-xl shadow-sm border border-border-color overflow-hidden animate-fadeIn">
                <!-- Detail Header -->
                <div class="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-border-color">
                    <div class="flex items-center gap-3">
                        <span class="font-mono text-sm text-primary font-bold">${inv.id}</span>
                        <span class="text-gray-300">|</span>
                        <h3 class="text-lg font-semibold text-gray-800">${inv.title}</h3>
                        ${statusBadge(inv.status)}
                    </div>
                    <button id="invDetailClose" class="text-gray-400 hover:text-gray-600 transition-colors"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    <!-- Left Column: Summary + Evidence -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Investigation Summary -->
                        <div class="bg-white rounded-lg border border-border-color p-5">
                            <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3"><i class="fa-solid fa-file-lines mr-2 text-primary"></i>Investigation Summary</h4>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span class="block text-xs text-gray-400 mb-1">Target</span>
                                    <span class="font-medium text-gray-800"><i class="fa-solid fa-user-secret mr-1 text-primary text-xs"></i>${inv.actorName}</span>
                                </div>
                                <div>
                                    <span class="block text-xs text-gray-400 mb-1">Risk Level</span>
                                    <span class="font-medium">${riskDot(inv.risk)}</span>
                                </div>
                                <div>
                                    <span class="block text-xs text-gray-400 mb-1">Confidence</span>
                                    <span class="font-bold text-gray-800">${inv.confidence}%</span>
                                </div>
                                <div>
                                    <span class="block text-xs text-gray-400 mb-1">Evidence Items</span>
                                    <span class="font-bold text-gray-800">${inv.evidenceTypes.length}</span>
                                </div>
                            </div>
                            <p class="text-sm text-gray-500 mt-4 leading-relaxed">
                                Ongoing investigation into <strong>${inv.actorName}</strong>'s operational infrastructure and identity indicators.
                                Current evidence supports a <strong>${inv.confidence}%</strong> confidence attribution based on
                                ${inv.evidenceTypes.slice(0, 2).join(' and ').toLowerCase()} analysis.
                                ${inv.status === 'Active' ? 'Active collection and analysis is in progress.' : inv.status === 'Pending Review' ? 'Awaiting senior analyst review before escalation.' : 'Investigation has been resolved and archived.'}
                            </p>
                        </div>

                        <!-- Evidence List -->
                        <div class="bg-white rounded-lg border border-border-color p-5">
                            <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3"><i class="fa-solid fa-list-check mr-2 text-primary"></i>Evidence</h4>
                            <div class="space-y-3">
                                ${inv.evidenceTypes.map((ev, idx) => `
                                    <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary text-xs">
                                                <i class="fa-solid ${evidenceIcons[ev] || 'fa-file'}"></i>
                                            </div>
                                            <div>
                                                <div class="text-sm font-medium text-gray-800">${ev}</div>
                                                <div class="text-xs text-gray-400">Collected ${Math.floor(Math.random() * 20) + 1} days ago</div>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <div class="w-20">${confidenceBar(evidenceConfidences[idx])}</div>
                                            <span class="text-xs font-semibold ${evidenceConfidences[idx] >= 80 ? 'text-green-600' : evidenceConfidences[idx] >= 60 ? 'text-amber-500' : 'text-red-500'}">
                                                ${evidenceConfidences[idx] >= 80 ? 'Strong' : evidenceConfidences[idx] >= 60 ? 'Moderate' : 'Weak'}
                                            </span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Timeline -->
                        <div class="bg-white rounded-lg border border-border-color p-5">
                            <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4"><i class="fa-solid fa-timeline mr-2 text-primary"></i>Investigation Timeline</h4>
                            <div class="relative pl-6 border-l-2 border-gray-200 space-y-5">
                                ${timelineEvents.map(te => `
                                    <div class="relative">
                                        <div class="absolute -left-[25px] top-0.5 w-4 h-4 rounded-full bg-white border-2 border-primary flex items-center justify-center">
                                            <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                        </div>
                                        <div class="flex items-start gap-3">
                                            <i class="fa-solid ${te.icon} ${te.color} mt-0.5"></i>
                                            <div>
                                                <div class="text-sm font-medium text-gray-800">${te.event}</div>
                                                <div class="text-xs text-gray-400">${te.date}</div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Related Entities + Risk Assessment -->
                    <div class="space-y-6">
                        <!-- Related Entities -->
                        <div class="bg-white rounded-lg border border-border-color p-5">
                            <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3"><i class="fa-solid fa-diagram-project mr-2 text-primary"></i>Related Entities</h4>
                            <ul class="space-y-3">
                                <li class="flex items-center gap-3 text-sm">
                                    <span class="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-primary text-xs"><i class="fa-solid fa-user-secret"></i></span>
                                    <div>
                                        <div class="font-medium text-gray-800">${inv.actorName}</div>
                                        <div class="text-xs text-gray-400">Primary target</div>
                                    </div>
                                </li>
                                ${actors.slice(0, 3).filter(a => (a.name || a.handle) !== inv.actorName).slice(0, 2).map(a => `
                                    <li class="flex items-center gap-3 text-sm">
                                        <span class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs"><i class="fa-solid fa-user"></i></span>
                                        <div>
                                            <div class="font-medium text-gray-700">${a.name || a.handle || 'Unknown'}</div>
                                            <div class="text-xs text-gray-400">Associated persona</div>
                                        </div>
                                    </li>
                                `).join('')}
                                <li class="flex items-center gap-3 text-sm">
                                    <span class="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-red-400 text-xs"><i class="fa-solid fa-server"></i></span>
                                    <div>
                                        <div class="font-medium text-gray-700 font-mono text-xs">185.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}</div>
                                        <div class="text-xs text-gray-400">C2 Infrastructure</div>
                                    </div>
                                </li>
                                <li class="flex items-center gap-3 text-sm">
                                    <span class="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 text-xs"><i class="fa-solid fa-globe"></i></span>
                                    <div>
                                        <div class="font-medium text-gray-700 font-mono text-xs">${(inv.actorName || 'site').toLowerCase().replace(/\s/g, '')}xyz.onion</div>
                                        <div class="text-xs text-gray-400">Hidden service</div>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <!-- Risk Assessment -->
                        <div class="bg-white rounded-lg border border-border-color p-5">
                            <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3"><i class="fa-solid fa-shield-halved mr-2 text-primary"></i>Risk Assessment</h4>
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-14 h-14 rounded-xl bg-${rc}-100 flex items-center justify-center">
                                    <span class="text-xl font-bold text-${rc}-600">${inv.risk === 'High' ? 'H' : inv.risk === 'Medium' ? 'M' : 'L'}</span>
                                </div>
                                <div>
                                    <div class="font-semibold text-gray-800">${inv.risk} Risk</div>
                                    <div class="text-xs text-gray-400">Overall threat level</div>
                                </div>
                            </div>
                            <div class="space-y-3">
                                ${[
                                    { label: 'Impact', value: inv.risk === 'High' ? 90 : inv.risk === 'Medium' ? 60 : 30 },
                                    { label: 'Likelihood', value: inv.confidence },
                                    { label: 'Urgency', value: inv.status === 'Active' ? 85 : inv.status === 'Pending Review' ? 55 : 20 },
                                ].map(m => `
                                    <div>
                                        <div class="flex justify-between text-xs mb-1">
                                            <span class="text-gray-500">${m.label}</span>
                                            <span class="font-semibold text-gray-700">${m.value}%</span>
                                        </div>
                                        <div class="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                            <div class="h-full rounded-full ${m.value >= 70 ? 'bg-red-400' : m.value >= 45 ? 'bg-amber-400' : 'bg-green-400'}" style="width:${m.value}%"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
                                <div class="text-xs font-semibold text-gray-600 mb-1"><i class="fa-solid fa-note-sticky mr-1 text-primary"></i>Analyst Note</div>
                                <p class="text-xs text-gray-500 leading-relaxed">
                                    ${inv.risk === 'High'
                                        ? 'Recommend immediate escalation. Multiple high-confidence indicators converge on a single attribution hypothesis.'
                                        : inv.risk === 'Medium'
                                        ? 'Additional evidence collection recommended before escalation. Current indicators are suggestive but not conclusive.'
                                        : 'Low-priority case. Evidence is circumstantial. Monitor for new developments before allocating resources.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Scroll to detail
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Close button
        document.getElementById('invDetailClose')?.addEventListener('click', () => {
            panel.innerHTML = '';
        });
    }
}

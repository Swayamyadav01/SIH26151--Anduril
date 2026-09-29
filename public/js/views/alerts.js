function renderAlerts(container) {
    const actors = appState.data.actors || [];
    const infra = appState.data.infrastructure || [];

    // --------------- Generate contextual alerts from real data ---------------
    const alertTemplates = [
        {
            severity: 'HIGH',
            type: 'Persona',
            titleFn: (a) => `New persona detected: ${a.primary_handle} active on BreachForums`,
            descFn:  (a) => `Threat actor "${a.primary_handle}" was observed posting new data-leak listings on BreachForums with ${a.handles ? a.handles.length : 0} known aliases.`,
            status: 'New',
            agoLabel: '5m ago',
        },
        {
            severity: 'MEDIUM',
            type: 'Infrastructure',
            titleFn: (a, s) => `Infrastructure change: SSL certificate updated on ${s ? s.onion_address.substring(0,12) + '...onion' : 'unknown.onion'}`,
            descFn:  (a, s) => `The SSL certificate fingerprint changed for hidden service ${s ? s.onion_address.substring(0,16) : 'N/A'}. Possible server migration detected.`,
            status: 'New',
            agoLabel: '18m ago',
        },
        {
            severity: 'HIGH',
            type: 'Financial',
            titleFn: (a) => `New wallet association: BTC wallet linked to ${a.primary_handle}`,
            descFn:  (a) => `A previously unseen Bitcoin wallet has been linked to "${a.primary_handle}" through on-chain clustering analysis. ${a.crypto_wallets && a.crypto_wallets.length ? 'Total wallets tracked: ' + (a.crypto_wallets.length + 1) : ''}`,
            status: 'New',
            agoLabel: '42m ago',
        },
        {
            severity: 'MEDIUM',
            type: 'Stylometry',
            titleFn: (a) => `Stylometric match: Writing pattern similarity detected for ${a.primary_handle}`,
            descFn:  (a) => `NLP analysis detected an 87% vocabulary-richness overlap between "${a.primary_handle}" and an unattributed forum post cluster.`,
            status: 'Acknowledged',
            agoLabel: '1h ago',
        },
        {
            severity: 'HIGH',
            type: 'Scan',
            titleFn: (a, s) => `Service scan complete: Origin IP exposed for ${a.primary_handle} node`,
            descFn:  (a, s) => `Passive reconnaissance revealed a clearnet IP leaking through misconfigured headers on a hidden service associated with "${a.primary_handle}".`,
            status: 'New',
            agoLabel: '2h ago',
        },
        {
            severity: 'LOW',
            type: 'Persona',
            titleFn: (a) => `Alias update: New handle registered by ${a.primary_handle}`,
            descFn:  (a) => `A new alias was registered on a monitored marketplace and linked to the "${a.primary_handle}" cluster via PGP key reuse.`,
            status: 'Acknowledged',
            agoLabel: '3h ago',
        },
        {
            severity: 'MEDIUM',
            type: 'Infrastructure',
            titleFn: (a, s) => `Hidden service uptime anomaly: ${s ? s.onion_address.substring(0,12) + '...onion' : 'unknown.onion'}`,
            descFn:  (a, s) => `The monitored hidden service went offline for 47 minutes and reappeared with a different server banner, indicating a potential host change.`,
            status: 'Resolved',
            agoLabel: '5h ago',
        },
        {
            severity: 'HIGH',
            type: 'Financial',
            titleFn: (a) => `Large transaction alert: ${a.primary_handle} wallet received 4.2 BTC`,
            descFn:  (a) => `An incoming transaction of 4.2 BTC (~$178,500) was detected on a wallet attributed to "${a.primary_handle}". Source wallet flagged by chainalysis.`,
            status: 'New',
            agoLabel: '6h ago',
        },
        {
            severity: 'LOW',
            type: 'Scan',
            titleFn: (a) => `Scheduled scan completed for ${a.primary_handle} infrastructure`,
            descFn:  (a) => `The routine weekly scan of all services linked to "${a.primary_handle}" completed with no new findings. 3 services remain online.`,
            status: 'Resolved',
            agoLabel: '8h ago',
        },
        {
            severity: 'MEDIUM',
            type: 'Persona',
            titleFn: (a) => `Forum activity spike: ${a.primary_handle} posted 14 messages in 1 hour`,
            descFn:  (a) => `Unusual posting frequency detected for "${a.primary_handle}" on a monitored dark web forum. Content analysis indicates possible data dump announcement.`,
            status: 'Acknowledged',
            agoLabel: '12h ago',
        },
    ];

    const alerts = alertTemplates.map((tpl, idx) => {
        const actor = actors[idx % actors.length] || { primary_handle: 'UnknownActor', handles: [], crypto_wallets: [] };
        const service = infra[idx % Math.max(infra.length, 1)] || null;
        return {
            id: `ALR-${String(1000 + idx).slice(1)}`,
            severity: tpl.severity,
            type: tpl.type,
            title: tpl.titleFn(actor, service),
            description: tpl.descFn(actor, service),
            persona: actor.primary_handle,
            status: tpl.status,
            agoLabel: tpl.agoLabel,
        };
    });

    // --------------- Counts ---------------
    const totalAlerts = alerts.length;
    const highCount   = alerts.filter(a => a.severity === 'HIGH').length;
    const medCount    = alerts.filter(a => a.severity === 'MEDIUM').length;
    const lowCount    = alerts.filter(a => a.severity === 'LOW').length;

    // --------------- Severity helpers ---------------
    const sevDot = (sev) => {
        if (sev === 'HIGH')   return 'bg-danger';
        if (sev === 'MEDIUM') return 'bg-warning';
        return 'bg-success';
    };
    const sevText = (sev) => {
        if (sev === 'HIGH')   return 'text-danger';
        if (sev === 'MEDIUM') return 'text-warning';
        return 'text-success';
    };
    const statusBadge = (status) => {
        if (status === 'New')          return '<span class="badge badge-high">New</span>';
        if (status === 'Acknowledged') return '<span class="badge badge-medium">Acknowledged</span>';
        return '<span class="badge badge-low">Resolved</span>';
    };

    // --------------- Build alert card HTML ---------------
    const buildAlertCard = (alert) => `
        <div class="alert-card bg-surface rounded-xl shadow-sm border border-border-color p-4 flex items-start gap-4 hover:shadow-md transition-shadow group"
             data-severity="${alert.severity}" data-type="${alert.type}" data-status="${alert.status}">
            <!-- Severity dot -->
            <div class="flex-shrink-0 pt-1">
                <div class="w-3 h-3 rounded-full ${sevDot(alert.severity)} ring-4 ${alert.severity === 'HIGH' ? 'ring-red-100' : alert.severity === 'MEDIUM' ? 'ring-amber-100' : 'ring-green-100'}"></div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <span class="text-[11px] font-bold uppercase ${sevText(alert.severity)}">${alert.severity}</span>
                    <span class="text-xs text-gray-400">•</span>
                    <span class="text-xs text-gray-500">${alert.type}</span>
                </div>
                <h4 class="font-semibold text-gray-800 text-sm leading-snug mb-1">${alert.title}</h4>
                <p class="text-xs text-text-muted leading-relaxed mb-2">${alert.description}</p>
                <div class="flex items-center gap-3 flex-wrap">
                    <span class="inline-flex items-center text-xs text-primary font-medium bg-primary-light px-2 py-0.5 rounded">
                        <i class="fa-solid fa-user-secret mr-1 text-[10px]"></i>${alert.persona}
                    </span>
                    <span class="text-[11px] text-gray-400"><i class="fa-regular fa-clock mr-1"></i>${alert.agoLabel}</span>
                </div>
            </div>

            <!-- Right: Status + Actions -->
            <div class="flex flex-col items-end gap-2 flex-shrink-0">
                ${statusBadge(alert.status)}
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="text-xs text-primary hover:text-primary-dark hover:bg-primary-light px-2 py-1 rounded transition-colors font-medium" title="View details">View</button>
                    <button class="text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 px-2 py-1 rounded transition-colors font-medium" title="Dismiss alert">Dismiss</button>
                </div>
            </div>
        </div>
    `;

    // --------------- Page markup ---------------
    container.innerHTML = `
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                    <i class="fa-solid fa-bell mr-3 text-primary"></i> Alerts
                </h2>
                <p class="text-sm text-text-muted mt-1">Real-time notifications from threat intelligence pipelines and automated scanners.</p>
            </div>
            <button id="mark-all-read-btn" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm">
                <i class="fa-solid fa-check-double mr-2"></i>Mark All Read
            </button>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-surface rounded-xl p-4 shadow-sm border border-border-color">
                <div class="flex items-center text-primary mb-2">
                    <i class="fa-solid fa-bell bg-primary-light p-2 rounded-lg text-sm mr-2"></i>
                    <span class="text-xs font-semibold text-gray-500 uppercase">Total Alerts</span>
                </div>
                <div class="text-2xl font-bold text-gray-800">${totalAlerts}</div>
                <div class="text-xs text-success mt-1"><i class="fa-solid fa-arrow-down mr-1"></i>3 fewer than yesterday</div>
            </div>
            <div class="bg-surface rounded-xl p-4 shadow-sm border border-border-color">
                <div class="flex items-center text-danger mb-2">
                    <i class="fa-solid fa-circle-exclamation bg-red-50 p-2 rounded-lg text-sm mr-2"></i>
                    <span class="text-xs font-semibold text-gray-500 uppercase">High Severity</span>
                </div>
                <div class="text-2xl font-bold text-gray-800">${highCount}</div>
                <div class="text-xs text-danger mt-1"><i class="fa-solid fa-arrow-up mr-1"></i>2 new today</div>
            </div>
            <div class="bg-surface rounded-xl p-4 shadow-sm border border-border-color">
                <div class="flex items-center text-warning mb-2">
                    <i class="fa-solid fa-triangle-exclamation bg-amber-50 p-2 rounded-lg text-sm mr-2"></i>
                    <span class="text-xs font-semibold text-gray-500 uppercase">Medium Severity</span>
                </div>
                <div class="text-2xl font-bold text-gray-800">${medCount}</div>
                <div class="text-xs text-gray-500 mt-1"><i class="fa-solid fa-minus mr-1"></i>Unchanged</div>
            </div>
            <div class="bg-surface rounded-xl p-4 shadow-sm border border-border-color">
                <div class="flex items-center text-success mb-2">
                    <i class="fa-solid fa-info-circle bg-green-50 p-2 rounded-lg text-sm mr-2"></i>
                    <span class="text-xs font-semibold text-gray-500 uppercase">Low Severity</span>
                </div>
                <div class="text-2xl font-bold text-gray-800">${lowCount}</div>
                <div class="text-xs text-success mt-1"><i class="fa-solid fa-arrow-down mr-1"></i>1 resolved</div>
            </div>
        </div>

        <!-- Filter Bar -->
        <div class="bg-surface rounded-xl shadow-sm border border-border-color mb-6">
            <div class="p-4 flex flex-wrap gap-3 items-center bg-gray-50/50 rounded-xl">
                <div class="relative flex-1 min-w-[200px]">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa-solid fa-search text-gray-400"></i>
                    </div>
                    <input type="text" id="alert-search" class="block w-full pl-10 pr-3 py-1.5 border border-border-color rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-primary" placeholder="Search alerts...">
                </div>
                <div class="flex items-center text-sm">
                    <span class="text-gray-500 mr-2">Severity:</span>
                    <select id="alert-severity-filter" class="border border-border-color rounded-md px-2 py-1.5 focus:outline-none focus:border-primary text-gray-700 text-sm">
                        <option value="ALL">All</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                </div>
                <div class="flex items-center text-sm">
                    <span class="text-gray-500 mr-2">Type:</span>
                    <select id="alert-type-filter" class="border border-border-color rounded-md px-2 py-1.5 focus:outline-none focus:border-primary text-gray-700 text-sm">
                        <option value="ALL">All Types</option>
                        <option value="Persona">Persona</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Financial">Financial</option>
                        <option value="Stylometry">Stylometry</option>
                        <option value="Scan">Scan</option>
                    </select>
                </div>
                <div class="flex items-center text-sm">
                    <span class="text-gray-500 mr-2">Date:</span>
                    <select id="alert-date-filter" class="border border-border-color rounded-md px-2 py-1.5 focus:outline-none focus:border-primary text-gray-700 text-sm">
                        <option>Last 24 hours</option>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>All time</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Alert List -->
        <div id="alerts-list" class="space-y-3">
            ${alerts.map(a => buildAlertCard(a)).join('')}
        </div>

        <!-- Empty State (hidden by default) -->
        <div id="alerts-empty" class="hidden bg-surface rounded-xl shadow-sm border border-border-color p-12 text-center">
            <i class="fa-solid fa-bell-slash text-4xl text-gray-300 mb-4"></i>
            <h3 class="font-semibold text-gray-600 mb-1">No alerts match your filters</h3>
            <p class="text-sm text-text-muted">Try adjusting severity, type, or search criteria.</p>
        </div>
    `;

    // --------------- Interactive behaviour ---------------
    setTimeout(() => {
        const searchInput    = document.getElementById('alert-search');
        const sevFilter      = document.getElementById('alert-severity-filter');
        const typeFilter     = document.getElementById('alert-type-filter');
        const alertsList     = document.getElementById('alerts-list');
        const emptyState     = document.getElementById('alerts-empty');
        const markAllBtn     = document.getElementById('mark-all-read-btn');

        function applyFilters() {
            const query   = (searchInput ? searchInput.value : '').toLowerCase();
            const sevVal  = sevFilter  ? sevFilter.value  : 'ALL';
            const typeVal = typeFilter ? typeFilter.value : 'ALL';

            const cards = alertsList ? alertsList.querySelectorAll('.alert-card') : [];
            let visibleCount = 0;

            cards.forEach(card => {
                const matchesSev  = sevVal  === 'ALL' || card.dataset.severity === sevVal;
                const matchesType = typeVal === 'ALL' || card.dataset.type     === typeVal;
                const text        = card.textContent.toLowerCase();
                const matchesSearch = !query || text.includes(query);

                if (matchesSev && matchesType && matchesSearch) {
                    card.classList.remove('hidden');
                    visibleCount++;
                } else {
                    card.classList.add('hidden');
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('hidden', visibleCount > 0);
            }
        }

        if (searchInput) searchInput.addEventListener('input', applyFilters);
        if (sevFilter)   sevFilter.addEventListener('change', applyFilters);
        if (typeFilter)  typeFilter.addEventListener('change', applyFilters);

        // Mark All Read — swap all "New" badges to "Acknowledged"
        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => {
                const cards = alertsList ? alertsList.querySelectorAll('.alert-card') : [];
                cards.forEach(card => {
                    const badge = card.querySelector('.badge-high');
                    if (badge && badge.textContent.trim() === 'New') {
                        badge.className = 'badge badge-medium';
                        badge.textContent = 'Acknowledged';
                        card.dataset.status = 'Acknowledged';
                    }
                });
                markAllBtn.innerHTML = '<i class="fa-solid fa-check-double mr-2"></i>All Marked Read';
                markAllBtn.classList.add('opacity-60', 'pointer-events-none');
            });
        }

        // Dismiss buttons
        if (alertsList) {
            alertsList.addEventListener('click', (e) => {
                const dismissBtn = e.target.closest('button[title="Dismiss alert"]');
                if (dismissBtn) {
                    const card = dismissBtn.closest('.alert-card');
                    if (card) {
                        card.style.transition = 'opacity 0.3s, transform 0.3s';
                        card.style.opacity = '0';
                        card.style.transform = 'translateX(20px)';
                        setTimeout(() => {
                            card.remove();
                            // Check if list is now empty
                            const remaining = alertsList.querySelectorAll('.alert-card:not(.hidden)');
                            if (remaining.length === 0 && emptyState) {
                                emptyState.classList.remove('hidden');
                            }
                        }, 300);
                    }
                }
            });
        }
    }, 50);
}

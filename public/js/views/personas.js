function renderPersonas(container) {
    const actors = appState.data.actors || [];
    const highRisk = actors.filter(a => a.threat_level === 'CRITICAL' || a.threat_level === 'HIGH').length;
    const active = actors.filter(a => a.last_active).length;

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                    <i class="fa-solid fa-user-group mr-3 text-primary"></i> Personas
                </h2>
                <p class="text-sm text-text-muted mt-1">Track and analyze dark web personas, their aliases, and related activity.</p>
            </div>
            <button class="btn-primary"><i class="fa-solid fa-plus"></i> Add Persona</button>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="stat-card">
                <div class="flex items-center text-primary mb-2"><i class="fa-solid fa-user-group text-sm mr-2"></i><span class="text-[11px] font-semibold text-gray-400 uppercase">Total Personas</span></div>
                <div class="text-2xl font-bold text-gray-800">${actors.length.toLocaleString()}</div>
                <div class="text-xs text-emerald-500 mt-1 font-medium"><i class="fa-solid fa-arrow-trend-up mr-1 text-[10px]"></i>+${actors.length} indexed</div>
            </div>
            <div class="stat-card">
                <div class="flex items-center text-danger mb-2"><i class="fa-solid fa-triangle-exclamation text-sm mr-2"></i><span class="text-[11px] font-semibold text-gray-400 uppercase">High Risk</span></div>
                <div class="text-2xl font-bold text-gray-800">${highRisk}</div>
                <div class="text-xs text-red-500 mt-1 font-medium"><i class="fa-solid fa-arrow-trend-up mr-1 text-[10px]"></i>+${highRisk} this week</div>
            </div>
            <div class="stat-card">
                <div class="flex items-center text-blue-500 mb-2"><i class="fa-solid fa-link text-sm mr-2"></i><span class="text-[11px] font-semibold text-gray-400 uppercase">Linked Clusters</span></div>
                <div class="text-2xl font-bold text-gray-800">287</div>
                <div class="text-xs text-emerald-500 mt-1 font-medium"><i class="fa-solid fa-arrow-trend-up mr-1 text-[10px]"></i>+14 this week</div>
            </div>
            <div class="stat-card">
                <div class="flex items-center text-emerald-500 mb-2"><i class="fa-solid fa-circle-check text-sm mr-2"></i><span class="text-[11px] font-semibold text-gray-400 uppercase">Active Personas</span></div>
                <div class="text-2xl font-bold text-gray-800">${active.toLocaleString()}</div>
                <div class="text-xs text-emerald-500 mt-1 font-medium"><i class="fa-solid fa-arrow-trend-up mr-1 text-[10px]"></i>+${active} this week</div>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- Table -->
            <div class="lg:col-span-3 stat-card !p-0 flex flex-col">
                <!-- Filters -->
                <div class="p-4 border-b border-border-color flex flex-wrap gap-3 items-center bg-gray-50/50 rounded-t-xl">
                    <div class="relative flex-1 min-w-[180px]">
                        <i class="fa-solid fa-search text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
                        <input type="text" id="persona-search" class="w-full pl-9 pr-3 py-2 border border-border-color rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="Search persona, alias, wallet, PGP key...">
                    </div>
                    <select id="risk-filter" class="border border-border-color rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-primary">
                        <option value="">Risk: All</option><option value="CRITICAL">Critical</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option>
                    </select>
                    <select id="status-filter" class="border border-border-color rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:border-primary">
                        <option value="active">Status: Active</option><option value="">All</option>
                    </select>
                    <div class="flex border border-border-color rounded-lg p-0.5 ml-auto">
                        <button class="px-2.5 py-1.5 bg-white shadow-sm rounded-md text-gray-700 text-xs"><i class="fa-solid fa-list"></i></button>
                        <button class="px-2.5 py-1.5 text-gray-400 hover:text-gray-600 text-xs"><i class="fa-solid fa-border-all"></i></button>
                    </div>
                </div>
                
                <!-- Table Header -->
                <div class="overflow-x-auto flex-1">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th class="pl-5">PERSONA</th>
                                <th>ALIASES</th>
                                <th>RISK</th>
                                <th>CONFIDENCE</th>
                                <th>LAST SEEN <i class="fa-solid fa-chevron-down text-[8px] ml-1"></i></th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody id="personas-tbody"></tbody>
                    </table>
                </div>
            </div>

            <!-- Side Widgets -->
            <div class="space-y-6">
                <div class="stat-card">
                    <h3 class="font-semibold text-gray-800 mb-4 text-sm">Risk Distribution</h3>
                    <div class="flex items-center">
                        <div class="w-24 h-24 relative mr-4 flex-shrink-0">
                            <canvas id="riskChart"></canvas>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span class="text-lg font-bold text-gray-800">${actors.length.toLocaleString()}</span>
                                <span class="text-[8px] text-gray-400 font-semibold uppercase leading-tight text-center">Total<br>Personas</span>
                            </div>
                        </div>
                        <div class="flex-1 space-y-3">
                            <div class="flex items-center justify-between text-xs"><div class="flex items-center"><div class="w-2.5 h-2.5 rounded-full bg-danger mr-2"></div><span class="font-medium text-gray-700">High</span></div><span class="text-gray-400 font-mono">${highRisk} (${actors.length ? Math.round(highRisk/actors.length*100) : 0}%)</span></div>
                            <div class="flex items-center justify-between text-xs"><div class="flex items-center"><div class="w-2.5 h-2.5 rounded-full bg-warning mr-2"></div><span class="font-medium text-gray-700">Medium</span></div><span class="text-gray-400 font-mono">${actors.length - highRisk} (${actors.length ? Math.round((actors.length-highRisk)/actors.length*100) : 0}%)</span></div>
                            <div class="flex items-center justify-between text-xs"><div class="flex items-center"><div class="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></div><span class="font-medium text-gray-700">Low</span></div><span class="text-gray-400 font-mono">0 (0%)</span></div>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="flex justify-between items-center mb-4"><h3 class="font-semibold text-gray-800 text-sm">Recent Personas</h3></div>
                    <div class="space-y-4" id="recent-personas-list"></div>
                    <a href="#" onclick="event.preventDefault()" class="block text-center text-xs font-medium text-primary mt-4 hover:underline">View all personas <i class="fa-solid fa-arrow-right ml-1"></i></a>
                </div>
            </div>
        </div>
        
        <!-- Persona Detail Modal -->
        <div id="persona-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 hidden items-center justify-center" style="display:none;"></div>
    `;

    setTimeout(() => {
        populatePersonasTable(actors);
        renderRiskDonut(actors);
        populateRecentPersonas(actors);
        
        // Wire up filters
        document.getElementById('persona-search')?.addEventListener('input', () => filterPersonas(actors));
        document.getElementById('risk-filter')?.addEventListener('change', () => filterPersonas(actors));
        document.getElementById('status-filter')?.addEventListener('change', () => filterPersonas(actors));
    }, 60);
}

function filterPersonas(allActors) {
    const q = (document.getElementById('persona-search')?.value || '').toLowerCase();
    const risk = document.getElementById('risk-filter')?.value || '';
    
    let filtered = allActors;
    if (q) filtered = filtered.filter(a => a.primary_handle.toLowerCase().includes(q) || (a.handles && a.handles.some(h => h.handle.toLowerCase().includes(q))) || a.id.toLowerCase().includes(q));
    if (risk) filtered = filtered.filter(a => a.threat_level === risk);
    
    populatePersonasTable(filtered);
}

function getRiskBadge(level) {
    if (level === 'CRITICAL') return '<span class="badge badge-high">Critical</span>';
    if (level === 'HIGH') return '<span class="badge badge-high">High</span>';
    if (level === 'MEDIUM') return '<span class="badge badge-medium">Medium</span>';
    return '<span class="badge badge-low">Low</span>';
}

function populatePersonasTable(actorsToRender) {
    const tbody = document.getElementById('personas-tbody');
    if (!tbody) return;

    if (!actorsToRender.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-12 text-gray-400"><i class="fa-solid fa-user-slash text-2xl mb-2 block"></i>No personas match your filters.</td></tr>';
        return;
    }

    const avatarColors = ['bg-red-100 text-red-600', 'bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-purple-100 text-purple-600', 'bg-amber-100 text-amber-600', 'bg-pink-100 text-pink-600'];

    tbody.innerHTML = actorsToRender.map((actor, idx) => {
        const aliasCount = actor.handles ? actor.handles.length : 0;
        const aliases = actor.handles ? actor.handles.map(h => h.handle).slice(0, 2).join(', ') : '';
        const moreAliases = aliasCount > 2 ? `...` : '';
        const initial = actor.primary_handle.charAt(0).toUpperCase();
        const avatarClass = avatarColors[actor.primary_handle.charCodeAt(0) % avatarColors.length];
        const confBarColor = actor.attribution_confidence >= 90 ? 'high' : actor.attribution_confidence >= 70 ? 'medium' : 'low';
        const lastActive = actor.last_active ? new Date(actor.last_active).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown';
        const lastTime = actor.last_active ? new Date(actor.last_active).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';

        return `
            <tr class="group cursor-pointer" onclick="openPersonaDetail('${actor.id}')">
                <td class="pl-5">
                    <div class="flex items-center">
                        <div class="w-9 h-9 rounded-full ${avatarClass} flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">${initial}</div>
                        <div>
                            <div class="font-semibold text-gray-800 group-hover:text-primary transition-colors">${actor.primary_handle}</div>
                            <div class="text-[11px] text-gray-400">${aliasCount} aliases</div>
                        </div>
                    </div>
                </td>
                <td class="text-gray-500 text-sm max-w-[150px]"><span class="truncate block" title="${actor.handles?.map(h=>h.handle).join(', ')}">${aliases}${moreAliases}</span></td>
                <td>${getRiskBadge(actor.threat_level)}</td>
                <td>
                    <div class="flex items-center gap-2">
                        <div class="confidence-bar w-16"><div class="fill ${confBarColor}" style="width:${actor.attribution_confidence}%"></div></div>
                        <span class="text-sm font-semibold text-gray-700">${actor.attribution_confidence}%</span>
                    </div>
                </td>
                <td>
                    <div class="text-sm text-gray-700">${lastActive}</div>
                    <div class="text-[11px] text-gray-400">${lastTime}</div>
                </td>
                <td>
                    <button class="text-primary font-medium hover:text-primary-dark text-sm hover:bg-primary/10 px-3 py-1 rounded-lg transition-colors" onclick="event.stopPropagation(); openPersonaDetail('${actor.id}')">View</button>
                </td>
            </tr>
        `;
    }).join('');
}

function renderRiskDonut(actors) {
    const ctx = document.getElementById('riskChart');
    if (!ctx) return;
    const high = actors.filter(a => a.threat_level === 'CRITICAL' || a.threat_level === 'HIGH').length;
    const med = actors.filter(a => a.threat_level === 'MEDIUM').length;
    const low = actors.length - high - med;
    new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['High', 'Medium', 'Low'], datasets: [{ data: [high, med, low], backgroundColor: ['#ef4444', '#f59e0b', '#10b981'], borderWidth: 0, cutout: '72%' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: true } } }
    });
}

function populateRecentPersonas(actors) {
    const container = document.getElementById('recent-personas-list');
    if (!container || !actors.length) return;
    const avatarColors = ['bg-red-100 text-red-600', 'bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-purple-100 text-purple-600'];
    
    container.innerHTML = actors.slice(0, 4).map((actor, i) => {
        const initial = actor.primary_handle.charAt(0).toUpperCase();
        const color = avatarColors[i % avatarColors.length];
        return `
            <div class="flex items-center cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded-lg transition-colors" onclick="openPersonaDetail('${actor.id}')">
                <div class="w-8 h-8 rounded-full ${color} flex items-center justify-center font-bold text-xs mr-3 flex-shrink-0">${initial}</div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center mb-0.5">
                        <span class="font-semibold text-gray-800 text-sm truncate">${actor.primary_handle}</span>
                        ${getRiskBadge(actor.threat_level)}
                    </div>
                    <div class="text-[11px] text-gray-400">5 minutes ago</div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== PERSONA DETAIL MODAL =====

function openPersonaDetail(actorId) {
    const actor = appState.data.actors.find(a => a.id === actorId);
    if (!actor) return;
    
    const modal = document.getElementById('persona-modal');
    modal.style.display = 'flex';
    
    const initial = actor.primary_handle.charAt(0).toUpperCase();
    const handles = actor.handles || [];
    const wallets = actor.crypto_wallets || [];
    const pgps = actor.pgp_fingerprints || [];
    const infra = actor.infrastructure || [];
    const stylo = actor.stylometrics || {};
    const suspect = actor.suspect_real_entity || {};
    
    modal.innerHTML = `
        <div class="bg-surface rounded-2xl shadow-2xl w-full h-full max-w-[1200px] max-h-[90vh] flex flex-col overflow-hidden slide-in-right">
            <!-- Header -->
            <div class="border-b border-border-color px-6 py-4 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                <div class="flex items-center min-w-0">
                    <button class="text-gray-400 hover:text-gray-700 mr-4 transition-colors" onclick="closePersonaModal()"><i class="fa-solid fa-arrow-left"></i></button>
                    <div class="min-w-0">
                        <div class="flex items-center text-xs text-gray-400 mb-1">
                            <span class="hover:text-primary cursor-pointer" onclick="closePersonaModal(); navigateTo('personas')">Personas</span>
                            <i class="fa-solid fa-chevron-right text-[8px] mx-2"></i>
                            <span class="text-gray-700 font-medium">${actor.primary_handle}</span>
                        </div>
                        <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2 truncate">
                            ${actor.primary_handle} ${getRiskBadge(actor.threat_level)}
                            <span class="text-xs font-normal text-gray-400">${actor.id}</span>
                        </h2>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <button class="btn-secondary text-xs"><i class="fa-solid fa-download"></i> Export Evidence</button>
                    <button class="text-gray-400 hover:text-gray-700 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors" onclick="closePersonaModal()"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>
            </div>

            <!-- Tabs -->
            <div class="px-6 border-b border-border-color flex gap-1 overflow-x-auto flex-shrink-0 bg-white">
                <button class="py-3 px-4 border-b-2 border-primary text-primary font-medium text-sm flex items-center gap-2 whitespace-nowrap"><i class="fa-solid fa-border-all text-xs"></i> Overview</button>
                <button class="py-3 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors"><i class="fa-solid fa-tags text-xs"></i> Aliases (${handles.length})</button>
                <button class="py-3 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors"><i class="fa-solid fa-fingerprint text-xs"></i> Identifiers</button>
                <button class="py-3 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors"><i class="fa-solid fa-clock-rotate-left text-xs"></i> Activity</button>
                <button class="py-3 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors"><i class="fa-solid fa-link text-xs"></i> Relationships (${handles.length + wallets.length + pgps.length})</button>
                <button class="py-3 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors"><i class="fa-solid fa-server text-xs"></i> Services (${infra.length})</button>
                <button class="py-3 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors"><i class="fa-solid fa-timeline text-xs"></i> Timeline</button>
                <button class="py-3 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors"><i class="fa-solid fa-file-shield text-xs"></i> Evidence (${pgps.length + wallets.length + handles.length})</button>
                <button class="py-3 px-4 border-b-2 border-transparent text-gray-400 hover:text-gray-600 font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-colors"><i class="fa-solid fa-brain text-xs"></i> AI Analysis</button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto p-6 bg-background">
                <!-- Top Tags Row -->
                <div class="flex flex-wrap gap-2 mb-6">
                    <span class="chip"><i class="fa-solid fa-language mr-1.5 text-[10px]"></i>${stylo.probable_native_language || 'English'}</span>
                    <span class="chip"><i class="fa-solid fa-clock mr-1.5 text-[10px]"></i>${stylo.primary_timezone_peak || 'UTC+0'}</span>
                    <span class="chip active"><i class="fa-solid fa-user-ninja mr-1.5 text-[10px]"></i>Dark Web Actor</span>
                    <span class="chip"><i class="fa-solid fa-check-double mr-1.5 text-[10px]"></i>${actor.attribution_confidence >= 80 ? 'High' : 'Medium'} Confidence</span>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Profile Summary -->
                    <div class="stat-card">
                        <h3 class="font-semibold text-gray-800 mb-5 flex items-center"><i class="fa-regular fa-user mr-2 text-primary"></i> Profile Summary</h3>
                        <div class="space-y-4">
                            ${profileRow('fa-regular fa-user', 'Primary Handle', actor.primary_handle)}
                            ${profileRow('fa-solid fa-briefcase', 'Role', actor.category)}
                            ${profileRow('fa-solid fa-star', 'Reputation Score', '★★★★☆ 4.2 / 5')}
                            ${profileRow('fa-solid fa-shield-halved', 'Threat Level', actor.threat_level)}
                            ${profileRow('fa-solid fa-check-double', 'Confidence', `<span class="font-bold text-emerald-600">${actor.attribution_confidence}%</span>`)}
                            ${profileRow('fa-solid fa-language', 'Language', stylo.probable_native_language || 'English')}
                            ${profileRow('fa-solid fa-clock', 'Operating Time Window', stylo.primary_timezone_peak || '18:00 - 02:00 (UTC)')}
                            ${profileRow('fa-solid fa-masks-theater', 'Behavior', actor.high_profile_targets ? 'Data broker, forum operator' : 'Unknown')}
                            <div class="flex items-start pt-2">
                                <span class="text-gray-400 w-1/3 text-xs flex items-center"><i class="fa-solid fa-layer-group mr-2 w-4 text-center text-[11px]"></i> Platforms</span>
                                <div class="w-2/3 flex flex-wrap gap-1.5">
                                    ${handles.map(h => `<span class="text-[11px] bg-primary/10 text-primary-dark px-2 py-0.5 rounded-md font-medium">${h.platform}</span>`).join('')}
                                </div>
                            </div>
                            ${profileRow('fa-regular fa-calendar', 'First Seen', actor.last_active ? 'May 20, 2025' : 'Unknown')}
                            ${profileRow('fa-solid fa-clock-rotate-left', 'Last Activity', actor.last_active ? new Date(actor.last_active).toLocaleString() : 'Unknown')}
                        </div>
                    </div>

                    <!-- Key Identifiers -->
                    <div class="stat-card">
                        <h3 class="font-semibold text-gray-800 mb-5 flex items-center"><i class="fa-solid fa-fingerprint mr-2 text-primary"></i> Key Identifiers</h3>
                        <div class="space-y-4">
                            ${pgps.length ? pgps.map(p => identifierRow('fa-solid fa-key', 'PGP Key', p.substring(0, 20) + '...', 'High')).join('') : ''}
                            ${wallets.map(w => identifierRow('fa-brands fa-bitcoin', `${w.currency} Address`, w.address.substring(0, 20) + '...', 'Medium')).join('')}
                            ${suspect.clearnet_ip ? identifierRow('fa-solid fa-server', 'Origin IP', suspect.clearnet_ip, 'High') : ''}
                            ${suspect.name ? identifierRow('fa-regular fa-user', 'Suspect Entity', suspect.name, 'Medium') : ''}
                            ${stylo.unique_punctuation_habits ? identifierRow('fa-solid fa-text-height', 'Fingerprint (Stylometric)', stylo.unique_punctuation_habits[0], 'Medium') : ''}
                            ${handles.length > 0 ? identifierRow('fa-solid fa-id-card', 'Session ID Pattern', `SID-${actor.id.replace('TA-','')}...`, 'Low') : ''}
                        </div>
                        <button class="w-full mt-5 text-sm text-primary font-medium hover:underline text-center">View all identifiers (${pgps.length + wallets.length + (suspect.clearnet_ip ? 1 : 0)}) <i class="fa-solid fa-arrow-right ml-1"></i></button>
                    </div>

                    <!-- Top Relationships -->
                    <div class="stat-card">
                        <h3 class="font-semibold text-gray-800 mb-5 flex items-center"><i class="fa-solid fa-link mr-2 text-primary"></i> Top Relationships</h3>
                        <div class="space-y-3">
                            ${handles.slice(0, 5).map((h, i) => {
                                const types = ['Possible Same Persona', 'Uses', 'Interacts', 'Active On', 'Linked'];
                                const typeColors = ['text-emerald-600 bg-emerald-50', 'text-blue-600 bg-blue-50', 'text-purple-600 bg-purple-50', 'text-amber-600 bg-amber-50', 'text-gray-600 bg-gray-50'];
                                const conf = Math.max(70, Math.round(actor.attribution_confidence - i * 3));
                                return `
                                    <div class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                        <div class="flex items-center min-w-0">
                                            <div class="severity-dot ${conf > 85 ? 'high' : conf > 70 ? 'medium' : 'low'} mr-3"></div>
                                            <div class="min-w-0">
                                                <span class="font-medium text-gray-800 text-sm block truncate">${h.handle}</span>
                                                <span class="text-[10px] ${typeColors[i % typeColors.length]} px-1.5 py-0.5 rounded font-medium">${types[i % types.length]}</span>
                                            </div>
                                        </div>
                                        <span class="text-sm font-bold text-gray-700 ml-2">${conf}%</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <button class="w-full mt-5 text-sm text-primary font-medium hover:underline text-center">View all relationships (${handles.length + wallets.length}) <i class="fa-solid fa-arrow-right ml-1"></i></button>
                    </div>
                </div>

                <!-- Bottom Row: Recent Activity, Active Services, AI Summary -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <!-- Recent Activity -->
                    <div class="stat-card">
                        <h3 class="font-semibold text-gray-800 mb-4 flex items-center"><i class="fa-solid fa-clock-rotate-left mr-2 text-primary"></i> Recent Activity</h3>
                        <table class="data-table">
                            <thead><tr><th>TYPE</th><th>DESCRIPTION</th><th>PLATFORM</th></tr></thead>
                            <tbody>
                                ${handles.slice(0, 3).map(h => `
                                    <tr>
                                        <td><span class="badge badge-info text-[10px]">Forum Post</span></td>
                                        <td class="text-xs text-gray-600 truncate max-w-[120px]">Active on ${h.platform}</td>
                                        <td class="text-xs text-gray-500">${h.platform}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Active Services / Platforms -->
                    <div class="stat-card">
                        <h3 class="font-semibold text-gray-800 mb-4 flex items-center"><i class="fa-solid fa-server mr-2 text-primary"></i> Active Services / Platforms</h3>
                        <table class="data-table">
                            <thead><tr><th>SERVICE</th><th>TYPE</th><th>STATUS</th></tr></thead>
                            <tbody>
                                ${infra.map(addr => `
                                    <tr>
                                        <td class="font-mono text-xs text-gray-600 truncate max-w-[120px]">${addr.substring(0, 18)}...</td>
                                        <td class="text-xs text-gray-500">Hidden Service</td>
                                        <td><span class="badge badge-low">Active</span></td>
                                    </tr>
                                `).join('') || '<tr><td colspan="3" class="text-center text-gray-400 text-xs py-4">No services linked</td></tr>'}
                                ${handles.filter(h => h.status === 'Active').slice(0, 2).map(h => `
                                    <tr>
                                        <td class="text-xs text-gray-600">${h.platform}</td>
                                        <td class="text-xs text-gray-500">Forum</td>
                                        <td><span class="badge badge-low">Active</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- AI Analysis Summary -->
                    <div class="stat-card">
                        <h3 class="font-semibold text-gray-800 mb-4 flex items-center"><i class="fa-solid fa-brain mr-2 text-primary"></i> AI Analysis Summary</h3>
                        <div class="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                            <div class="flex items-start">
                                <i class="fa-solid fa-brain text-primary mr-3 mt-0.5"></i>
                                <p class="text-sm text-gray-700 leading-relaxed">
                                    <span class="font-semibold">${actor.primary_handle}</span> exhibits consistent behavioral patterns across multiple platforms. Writing style analysis confirms high likelihood of single-operator identity.
                                </p>
                            </div>
                        </div>
                        <div class="space-y-3">
                            ${progressBar('Vocabulary Richness', Math.round(92 - Math.random() * 5))}
                            ${progressBar('Timezone Alignment', Math.round(88 - Math.random() * 5))}
                            ${progressBar('Punctuation Patterns', Math.round(85 - Math.random() * 5))}
                            ${progressBar('Sentence Structure', Math.round(79 - Math.random() * 5))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function closePersonaModal() {
    const modal = document.getElementById('persona-modal');
    if (modal) modal.style.display = 'none';
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePersonaModal();
});

// Helper functions
function profileRow(icon, label, value) {
    return `
        <div class="flex items-center border-b border-gray-50 pb-3">
            <span class="text-gray-400 w-1/3 text-xs flex items-center"><i class="${icon} mr-2 w-4 text-center text-[11px]"></i> ${label}</span>
            <span class="text-gray-800 w-2/3 text-sm font-medium">${value}</span>
        </div>
    `;
}

function identifierRow(icon, label, value, severity) {
    const sevClass = severity === 'High' ? 'text-danger' : severity === 'Medium' ? 'text-warning' : 'text-gray-400';
    return `
        <div class="evidence-card flex items-start gap-3">
            <i class="${icon} text-gray-400 mt-0.5 w-4 text-center"></i>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center mb-0.5">
                    <span class="font-medium text-sm text-gray-800">${label}</span>
                    <span class="text-[11px] font-semibold ${sevClass}">${severity}</span>
                </div>
                <span class="font-mono text-xs text-gray-500 truncate block">${value}</span>
            </div>
        </div>
    `;
}

function progressBar(label, value) {
    const color = value >= 85 ? 'bg-emerald-500' : value >= 70 ? 'bg-amber-500' : 'bg-red-500';
    return `
        <div>
            <div class="flex justify-between items-center text-xs mb-1">
                <span class="text-gray-600">${label}</span>
                <span class="font-semibold text-gray-700">${value}%</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5"><div class="${color} h-1.5 rounded-full transition-all duration-500" style="width:${value}%"></div></div>
        </div>
    `;
}

function renderDashboard(container) {
    const stats = appState.data.stats || {};
    const actors = appState.data.actors || [];
    const infra = appState.data.infrastructure || [];
    
    // Compute real stats
    const monitoredServices = stats.monitored_onion_services || infra.length || 4;
    const activeThreats = actors.filter(a => a.threat_level === 'CRITICAL' || a.threat_level === 'HIGH').length || 4;
    const personasTracked = stats.total_threat_actors || actors.length || 5;
    const infraIndicators = stats.deanonymized_origin_ips || 4;
    const totalLeaks = stats.total_leaks_indexed || 714;
    const avgConfidence = stats.avg_attribution_confidence || 88.1;

    container.innerHTML = `
        <!-- Top Stats Row (Clean layout - no text overflow) -->
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
            ${statCard('fa-solid fa-globe', 'Monitored Onions', monitoredServices, '+4 tracked', 'text-emerald-500')}
            ${statCard('fa-solid fa-shield-virus', 'Critical Threats', activeThreats, `${activeThreats} active`, 'text-rose-500')}
            ${statCard('fa-solid fa-user-group', 'Personas Tracked', personasTracked, `${personasTracked} profiles`, 'text-emerald-500')}
            ${statCard('fa-solid fa-network-wired', 'Unmasked IPs', infraIndicators, `${infraIndicators} clearnet`, 'text-amber-500')}
            ${statCard('fa-solid fa-database', 'Leaks Indexed', totalLeaks, '+28 this week', 'text-emerald-500')}
            ${statCard('fa-solid fa-crosshairs', 'Attribution Conf.', avgConfidence + '%', 'High fidelity', 'text-teal-500')}
        </div>

        <!-- Middle Row: Threat Activity Chart + 3D Interactive World Globe -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <!-- Threat Activity Overview -->
            <div class="lg:col-span-2 stat-card flex flex-col justify-between">
                <div class="flex flex-wrap gap-2 justify-between items-center mb-4">
                    <div>
                        <h3 class="font-semibold text-text-main text-sm">Threat Activity Telemetry</h3>
                        <p class="text-[11px] text-text-muted">Correlated intelligence feeds across darknet forums & nodes</p>
                    </div>
                    <div class="flex bg-surface-secondary rounded-lg p-0.5 border border-border-color text-xs">
                        <button class="px-2.5 py-1 text-xs rounded-md bg-surface shadow-2xs font-semibold text-text-main">24H</button>
                        <button class="px-2.5 py-1 text-xs rounded-md text-text-muted font-medium hover:text-text-main transition-colors">7D</button>
                        <button class="px-2.5 py-1 text-xs rounded-md text-text-muted font-medium hover:text-text-main transition-colors">30D</button>
                        <button class="px-2.5 py-1 text-xs rounded-md text-text-muted font-medium hover:text-text-main transition-colors">90D</button>
                    </div>
                </div>
                <div class="h-64 w-full">
                    <canvas id="activityChart"></canvas>
                </div>
            </div>
            
            <!-- Real 3D Interactive Responsive Globe Card -->
            <div class="stat-card flex flex-col justify-between">
                <div class="flex justify-between items-center mb-1.5">
                    <div>
                        <h3 class="font-semibold text-text-main text-sm">3D Origin Attribution Globe</h3>
                        <p class="text-[11px] text-text-muted">Interactive 3D unmasked origin routes (Drag to rotate)</p>
                    </div>
                    <span class="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 3D WebGL
                    </span>
                </div>
                
                <!-- Globe 3D Container (Responsive Canvas) -->
                <div id="globe-card-wrapper" class="h-60 w-full bg-surface-secondary/40 rounded-lg border border-border-color relative overflow-hidden flex items-center justify-center">
                    <div id="globe-3d-canvas" class="w-full h-full cursor-grab active:cursor-grabbing"></div>
                    
                    <!-- Fallback SVG Map (shown if WebGL/Globe.gl is still initializing) -->
                    <div id="globe-fallback" class="absolute inset-0 flex items-center justify-center p-3 opacity-0 transition-opacity duration-300 pointer-events-none">
                        <svg viewBox="0 0 1000 500" class="w-full h-full text-text-muted/20" fill="currentColor">
                            <path d="M120,70 L220,60 L280,90 L260,150 L200,180 L230,220 L180,260 L140,220 L100,160 Z" />
                            <path d="M220,240 L280,260 L320,320 L290,440 L240,420 L210,320 Z" />
                            <path d="M460,80 L520,70 L560,90 L580,140 L520,170 L480,150 L450,110 Z" />
                            <path d="M470,180 L560,180 L600,260 L560,380 L500,360 L450,260 Z" />
                            <path d="M570,70 L820,60 L920,120 L860,220 L760,250 L660,200 L590,140 Z" />
                            <path d="M780,280 L880,290 L850,390 L770,360 Z" />
                        </svg>
                    </div>
                </div>

                <!-- Clean Legend -->
                <div class="mt-2.5 flex items-center justify-between text-[11px] text-text-muted">
                    <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-danger"></span> Origin IP (185.220.101.45)</span>
                    <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-teal-500"></span> Onion Services</span>
                    <span class="text-text-muted/80">Bucharest, RO</span>
                </div>
            </div>
        </div>

        <!-- Bottom Row: Alerts, Investigations, Top Services -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Recent Alerts -->
            <div class="stat-card flex flex-col" style="max-height: 380px;">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-semibold text-text-main text-sm">Forensic Alerts</h3>
                    <a href="#" onclick="event.preventDefault(); navigateTo('alerts')" class="text-xs text-primary font-medium hover:underline">View all</a>
                </div>
                <div class="flex-1 overflow-y-auto pr-1 space-y-3">
                    ${generateRecentAlerts(actors, infra)}
                </div>
            </div>
            
            <!-- Active Investigations -->
            <div class="stat-card flex flex-col" style="max-height: 380px;">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-semibold text-text-main text-sm">Active Cases</h3>
                    <a href="#" onclick="event.preventDefault(); navigateTo('investigations')" class="text-xs text-primary font-medium hover:underline">View all</a>
                </div>
                <div class="flex-1 overflow-y-auto">
                    <table class="data-table">
                        <thead>
                            <tr><th>CASE ID</th><th>SUBJECT</th><th>SEVERITY</th><th>STATUS</th></tr>
                        </thead>
                        <tbody>
                            ${generateInvestigationRows(actors)}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Monitored Onion Services -->
            <div class="stat-card flex flex-col" style="max-height: 380px;">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-semibold text-text-main text-sm">Monitored Onion Services</h3>
                    <a href="#" onclick="event.preventDefault(); navigateTo('services')" class="text-xs text-primary font-medium hover:underline">View all</a>
                </div>
                <div class="flex-1 overflow-y-auto">
                    <table class="data-table">
                        <thead>
                            <tr><th>HIDDEN SERVICE</th><th>ATTRIBUTION</th></tr>
                        </thead>
                        <tbody>
                            ${generateServiceRows(infra)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Threat Category Distribution & Confidence Overview -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div class="stat-card">
                <h3 class="font-semibold text-text-main text-sm mb-3">Threat Category Distribution</h3>
                <div class="h-52">
                    <canvas id="categoryChart"></canvas>
                </div>
            </div>
            <div class="stat-card">
                <h3 class="font-semibold text-text-main text-sm mb-3">Attribution Confidence per Actor</h3>
                <div class="h-52">
                    <canvas id="confidenceChart"></canvas>
                </div>
            </div>
        </div>
    `;

    // Render charts & 3D Globe
    setTimeout(() => {
        renderActivityChart();
        renderCategoryChart(actors);
        renderConfidenceChart(actors);
        init3DGlobe();
    }, 100);
}

// ===== 3D INTERACTIVE GLOBE CONTROLLER =====
let activeGlobe = null;

function init3DGlobe() {
    const container = document.getElementById('globe-3d-canvas');
    if (!container) return;
    
    // Clear previous globe instance if re-rendering
    container.innerHTML = '';

    if (typeof Globe === 'undefined') {
        // Fallback if CDN blocked
        const fallback = document.getElementById('globe-fallback');
        if (fallback) fallback.style.opacity = '1';
        return;
    }

    try {
        const width = container.clientWidth || 320;
        const height = container.clientHeight || 240;

        // Origin Attribution Data Points
        const markers = [
            { lat: 44.4323, lng: 26.1063, name: 'Bucharest, Romania', label: 'IntelBroker Origin IP: 185.220.101.45', color: '#f43f5e', size: 0.9 },
            { lat: 55.7558, lng: 37.6173, name: 'Moscow, Russia', label: 'LockBitSupp Host (AS12389)', color: '#f59e0b', size: 0.7 },
            { lat: -15.7975, lng: -47.8919, name: 'Brasilia, Brazil', label: 'USDoD (xmpp.usdod-intel.br)', color: '#14b8a6', size: 0.7 },
            { lat: 48.8566, lng: 2.3522, name: 'Paris, France', label: 'ShinyHunters Node Cluster', color: '#3b82f6', size: 0.6 },
            { lat: 38.9072, lng: -77.0369, name: 'Washington DC, USA', label: 'Target Defense Ingress Points', color: '#8b5cf6', size: 0.6 }
        ];

        // Threat De-Anonymization Arcs
        const arcs = [
            { startLat: 38.9072, startLng: -77.0369, endLat: 44.4323, endLng: 26.1063, color: ['#8b5cf6', '#f43f5e'] },
            { startLat: 48.8566, startLng: 2.3522, endLat: 44.4323, endLng: 26.1063, color: ['#3b82f6', '#f43f5e'] },
            { startLat: 55.7558, startLng: 37.6173, endLat: 44.4323, endLng: 26.1063, color: ['#f59e0b', '#f43f5e'] },
            { startLat: -15.7975, startLng: -47.8919, endLat: 44.4323, endLng: 26.1063, color: ['#14b8a6', '#f43f5e'] }
        ];

        // Concentric Rings for Unmasked IP
        const rings = [
            { lat: 44.4323, lng: 26.1063, maxR: 12, propagationSpeed: 2.5, repeatPeriod: 1200, color: () => '#f43f5e' }
        ];

        activeGlobe = Globe()
            (container)
            .width(width)
            .height(height)
            .globeImageUrl('https://unpkg.com/three-globe@2.45.2/example/img/earth-night.jpg')
            .bumpImageUrl('https://unpkg.com/three-globe@2.45.2/example/img/earth-topology.png')
            .backgroundColor('rgba(0,0,0,0)')
            .pointsData(markers)
            .pointAltitude(0.04)
            .pointColor('color')
            .pointRadius('size')
            .pointLabel(d => `<div class="bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded shadow-lg border border-slate-700 font-sans"><b>${d.name}</b><br/><span class="text-teal-400 font-mono text-[10px]">${d.label}</span></div>`)
            .arcsData(arcs)
            .arcColor('color')
            .arcDashLength(0.4)
            .arcDashGap(0.2)
            .arcDashAnimateTime(2000)
            .arcStroke(0.6)
            .ringsData(rings)
            .ringColor('color')
            .ringMaxRadius('maxR')
            .ringPropagationSpeed('propagationSpeed')
            .ringRepeatPeriod('repeatPeriod');

        // Smooth Auto-Rotation
        activeGlobe.controls().autoRotate = true;
        activeGlobe.controls().autoRotateSpeed = 0.8;
        activeGlobe.pointOfView({ lat: 30, lng: 10, altitude: 2.3 });

        // Responsive Resizing via ResizeObserver
        if (window.ResizeObserver) {
            const ro = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const w = entry.contentRect.width;
                    const h = entry.contentRect.height;
                    if (activeGlobe && w > 0 && h > 0) {
                        activeGlobe.width(w).height(h);
                    }
                }
            });
            ro.observe(container);
        }
    } catch (e) {
        console.warn('WebGL Globe initialization fallback:', e);
        const fallback = document.getElementById('globe-fallback');
        if (fallback) fallback.style.opacity = '1';
    }
}

// ===== HELPER FUNCTIONS (Optimized layout - no overflow) =====

function statCard(icon, label, value, trend, trendColor) {
    return `
        <div class="stat-card flex flex-col justify-between p-3.5 min-w-0">
            <div class="flex items-start justify-between gap-1.5 mb-2">
                <span class="text-[11px] font-semibold text-text-muted uppercase tracking-wider truncate" title="${label}">${label}</span>
                <div class="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <i class="${icon} text-xs"></i>
                </div>
            </div>
            <div class="text-xl sm:text-2xl font-bold text-text-main tracking-tight mb-1 truncate">${typeof value === 'number' ? value.toLocaleString() : value}</div>
            <div class="text-[11px] ${trendColor} font-medium flex items-center gap-1 truncate">
                <i class="fa-solid fa-arrow-trend-up text-[9px] flex-shrink-0"></i>
                <span class="truncate">${trend}</span>
            </div>
        </div>
    `;
}

function generateRecentAlerts(actors, infra) {
    const alerts = [];
    
    actors.forEach((a, i) => {
        if (i === 0) alerts.push({ severity: 'high', title: 'New leak telemetry indexed', desc: `${a.primary_handle} posted breach archive`, time: '5m ago' });
        if (i === 1) alerts.push({ severity: 'medium', title: 'TLS certificate correlation', desc: `${a.infrastructure?.[0]?.substring(0,14) || 'intelbrk83'}... cert match on clearnet`, time: '32m ago' });
        if (i === 2 && a.crypto_wallets?.length) alerts.push({ severity: 'high', title: 'Cryptocurrency cluster hit', desc: `Inbound transfer on ${a.crypto_wallets[0].currency} address`, time: '1h ago' });
    });
    
    if (infra.length > 0) {
        alerts.push({ severity: 'medium', title: 'Passive scan completed', desc: `Origin IP corroborated for ${infra[0].service_name}`, time: '2h ago' });
    }

    return alerts.map(a => `
        <div class="flex items-start group">
            <div class="severity-dot ${a.severity} mt-1.5 mr-2.5 flex-shrink-0"></div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-[10px] font-bold uppercase ${a.severity === 'high' ? 'text-danger' : 'text-warning'}">${a.severity}</span>
                    <span class="font-medium text-text-main text-xs truncate">${a.title}</span>
                </div>
                <p class="text-[11px] text-text-muted truncate">${a.desc}</p>
            </div>
            <span class="text-[10px] text-text-muted ml-2 flex-shrink-0 mt-0.5">${a.time}</span>
        </div>
    `).join('');
}

function generateInvestigationRows(actors) {
    const investigations = [
        { id: 'INV-042', risk: 'Critical', status: 'Active', statusClass: 'badge-high' },
        { id: 'INV-039', risk: 'High', status: 'Active', statusClass: 'badge-medium' },
        { id: 'INV-037', risk: 'High', status: 'Review', statusClass: 'badge-low' }
    ];
    
    return actors.slice(0, 3).map((a, i) => {
        const inv = investigations[i] || investigations[0];
        return `
            <tr>
                <td class="text-text-muted font-mono text-xs">${inv.id}</td>
                <td class="font-medium text-text-main text-xs truncate max-w-[120px]">${a.primary_handle}</td>
                <td><span class="badge ${inv.statusClass}">${inv.risk}</span></td>
                <td><span class="text-xs text-text-muted font-medium">${inv.status}</span></td>
            </tr>
        `;
    }).join('');
}

function generateServiceRows(infra) {
    if (!infra.length) return '<tr><td colspan="2" class="text-center text-text-muted py-4 text-xs">No services loaded</td></tr>';
    
    return infra.map(s => {
        const isUnmasked = s.origin_attribution && s.origin_attribution.clearnet_ip;
        return `
            <tr>
                <td>
                    <div class="flex items-center min-w-0">
                        <i class="fa-solid fa-globe text-primary mr-2 text-xs flex-shrink-0"></i>
                        <span class="font-mono text-xs text-text-main truncate max-w-[130px]" title="${s.onion_address}">${s.onion_address.substring(0,14)}...onion</span>
                    </div>
                </td>
                <td>
                    ${isUnmasked 
                        ? `<span class="badge badge-high text-[10px]">IP: ${s.origin_attribution.clearnet_ip}</span>` 
                        : `<span class="badge badge-low text-[10px]">Protected</span>`
                    }
                </td>
            </tr>
        `;
    }).join('');
}

// ===== CHARTS (Theme Adaptive) =====

function isDark() {
    return document.documentElement.classList.contains('dark');
}

function renderActivityChart() {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    const dark = isDark();
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['May 17', 'May 18', 'May 19', 'May 20', 'May 21', 'May 22', 'May 23'],
            datasets: [
                { label: 'New Onions', data: [12, 19, 15, 25, 22, 30, 28], borderColor: '#14b8a6', backgroundColor: 'rgba(20,184,166,0.06)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 },
                { label: 'Threat Actors', data: [8, 12, 10, 18, 15, 22, 25], borderColor: '#3b82f6', tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 },
                { label: 'Infra Probes', data: [5, 8, 6, 12, 10, 15, 12], borderColor: '#f59e0b', tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    display: true, position: 'top', align: 'start', 
                    labels: { boxWidth: 6, usePointStyle: true, pointStyle: 'line', padding: 14, color: dark ? '#94a3b8' : '#64748b', font: { size: 11, family: 'Inter' } } 
                } 
            },
            scales: {
                y: { beginAtZero: true, grid: { color: dark ? 'rgba(31, 41, 61, 0.6)' : '#f1f5f9' }, border: { display: false }, ticks: { font: { size: 10 }, color: '#94a3b8' } },
                x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 }, color: '#94a3b8' } }
            },
            interaction: { mode: 'index', intersect: false }
        }
    });
}

function renderCategoryChart(actors) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    const dark = isDark();
    
    const categories = {};
    actors.forEach(a => {
        const cat = (a.category || 'Threat Group').split(' ')[0];
        categories[cat] = (categories[cat] || 0) + 1;
    });
    
    const labels = Object.keys(categories).length ? Object.keys(categories) : ['Data Broker', 'Ransomware', 'Syndicate', 'APT'];
    const data = Object.values(categories).length ? Object.values(categories) : [2, 1, 1, 1];
    const colors = ['#14b8a6', '#ef4444', '#f59e0b', '#3b82f6'];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{ data: data, backgroundColor: colors, borderWidth: 0, cutout: '70%' }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    position: 'right', 
                    labels: { boxWidth: 8, usePointStyle: true, padding: 12, color: dark ? '#94a3b8' : '#64748b', font: { size: 11 } } 
                } 
            }
        }
    });
}

function renderConfidenceChart(actors) {
    const ctx = document.getElementById('confidenceChart');
    if (!ctx) return;
    const dark = isDark();
    
    const labels = actors.map(a => a.primary_handle);
    const data = actors.map(a => a.attribution_confidence);
    const bgColors = data.map(v => v >= 90 ? '#10b981' : v >= 80 ? '#f59e0b' : '#ef4444');

    if (!labels.length) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: 'Confidence %', data: data, backgroundColor: bgColors, borderRadius: 6, barThickness: 20 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { max: 100, grid: { color: dark ? 'rgba(31, 41, 61, 0.6)' : '#f1f5f9' }, border: { display: false }, ticks: { font: { size: 10 }, color: '#94a3b8', callback: v => v + '%' } },
                y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11, weight: '500' }, color: dark ? '#e2e8f0' : '#334155' } }
            }
        }
    });
}
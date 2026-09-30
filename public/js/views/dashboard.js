function renderDashboard(container) {
    const stats = appState.data.stats || {};
    const actors = appState.data.actors || [];
    const infra = appState.data.infrastructure || [];

    // Compute real stats
    const monitoredServices = stats.monitored_onion_services ?? infra.length;
    const activeThreats = actors.filter(a => a.threat_level === 'CRITICAL' || a.threat_level === 'HIGH').length;
    const personasTracked = stats.total_threat_actors ?? actors.length;
    const infraIndicators = stats.deanonymized_origin_ips ?? 0;
    const totalLeaks = stats.total_leaks_indexed ?? 0;
    const avgConfidence = stats.avg_attribution_confidence ?? 0;

    container.innerHTML = `
        <div class="dashboard-heading">
            <div><h1>Overview</h1></div>
            <span class="snapshot-label"><span class="severity-dot low"></span> Local snapshot</span>
        </div>
        <!-- Top Stats Row (Clean layout - no text overflow) -->
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
            ${statCard('fa-solid fa-globe', 'Monitored Services', monitoredServices, `${monitoredServices} tracked`, 'text-emerald-500')}
            ${statCard('fa-solid fa-shield-virus', 'Critical Threats', activeThreats, `${activeThreats} active`, 'text-rose-500')}
            ${statCard('fa-solid fa-user-group', 'Personas Tracked', personasTracked, `${personasTracked} profiles`, 'text-emerald-500')}
            ${statCard('fa-solid fa-network-wired', 'Unmasked IPs', infraIndicators, `${infraIndicators} clearnet`, 'text-amber-500')}
            ${statCard('fa-solid fa-database', 'Leaks Indexed', totalLeaks, 'Indexed records', 'text-emerald-500')}
            ${statCard('fa-solid fa-crosshairs', 'Attribution Conf.', avgConfidence + '%', 'High fidelity', 'text-teal-500')}
        </div>

        <!-- Middle Row: Threat Activity Chart + 3D Interactive World Globe -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-6">
            <!-- Threat Activity Overview -->
            <div class="stat-card flex flex-col justify-between">
                <div class="flex flex-wrap gap-2 justify-between items-center mb-4">
                    <div>
                        <h3 class="font-semibold text-text-main text-sm">Threat activity</h3>

                    </div>
                    <span class="badge badge-gray">Sample · 7D</span>
                </div>
                <div class="h-64 w-full">
                    <canvas id="activityChart"></canvas>
                </div>
            </div>

            <!-- Real 3D Interactive Responsive Globe Card -->
            <div class="stat-card flex flex-col justify-between">
                <div class="flex justify-between items-center mb-1.5">
                    <div>
                        <h3 class="font-semibold text-text-main text-sm">Origin attribution</h3>
                        <p id="globe-instructions" class="text-[11px] text-text-muted">Drag to rotate · Scroll to zoom</p>
                    </div>
                    <span id="globe-mode" class="badge badge-gray">
                        Vector map
                    </span>
                </div>

                <!-- Globe 3D Container (Responsive Canvas) -->
                <div id="globe-card-wrapper" class="h-64 w-full bg-surface-secondary/40 rounded-lg border border-border-color relative overflow-hidden flex items-center justify-center">
                    <div id="globe-3d-canvas" class="w-full h-full cursor-grab active:cursor-grabbing"></div>

                    <!-- Fallback SVG Map (shown if WebGL/Globe.gl is still initializing) -->
                    <div id="globe-fallback" class="absolute inset-0 flex items-center justify-center p-3">
                        <img src="assets/world-map.svg" class="w-full h-full" alt="World map: Bucharest origin connected to Washington DC, Paris, and Moscow">
                    </div>
                </div>

                <!-- Clean Legend -->
                <div class="mt-2.5 flex flex-wrap gap-2 items-center justify-between text-[11px] text-text-muted">
                    <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-danger"></span> Origin IP (185.220.101.45)</span>
                    <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-teal-500"></span> Ingress nodes</span>
                    <span class="text-text-muted/80">Bucharest, RO</span>
                </div>
            </div>
        </div>

        <!-- Bottom Row: Alerts, Investigations, Top Services -->
        <div class="grid grid-cols-1 2xl:grid-cols-3 xl:grid-cols-2 gap-5">
            <!-- Recent Alerts -->
            <div class="stat-card flex flex-col" style="max-height: 380px;">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-semibold text-text-main text-sm">Alerts</h3>
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

            <!-- Services -->
            <div class="stat-card flex flex-col" style="max-height: 380px;">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-semibold text-text-main text-sm">Services</h3>
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

        <!-- Threat categories & Confidence Overview -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div class="stat-card">
                <h3 class="font-semibold text-text-main text-sm mb-3">Threat categories</h3>
                <div class="h-52">
                    <canvas id="categoryChart"></canvas>
                </div>
            </div>
            <div class="stat-card">
                <h3 class="font-semibold text-text-main text-sm mb-3">Attribution confidence</h3>
                <div class="h-52">
                    <canvas id="confidenceChart"></canvas>
                </div>
            </div>
        </div>
    `;

    // Render charts & 3D Globe
    dashboardTimer = setTimeout(() => {
        if (!container.isConnected) return;
        renderActivityChart();
        renderCategoryChart(actors);
        renderConfidenceChart(actors);
        init3DGlobe();
    }, 100);
}

// ===== 3D INTERACTIVE GLOBE CONTROLLER =====
let activeGlobe = null;
let globeResizeObserver = null;
let dashboardTimer = null;
let globeAbort = null;
let globeCleanup = null;
function destroyDashboard() {
    clearTimeout(dashboardTimer);
    globeAbort?.abort();
    globeAbort = null;
    globeResizeObserver?.disconnect();
    globeResizeObserver = null;
    globeCleanup?.();
    globeCleanup = null;
    if (activeGlobe) {
        activeGlobe.pauseAnimation();
        activeGlobe._destructor();
        activeGlobe = null;
    }
}

async function init3DGlobe() {
    const container = document.getElementById('globe-3d-canvas');
    const fallback = document.getElementById('globe-fallback');
    const mode = document.getElementById('globe-mode');
    if (!container) return;
    if (typeof Globe === 'undefined') {
        document.getElementById('globe-instructions').textContent = 'Geographic overview · Static fallback';
        return;
    }
    const showFallback = () => {
        fallback.hidden = false;
        container.style.visibility = 'hidden';
        mode.textContent = 'Vector map';
        document.getElementById('globe-instructions').textContent = 'Geographic overview · Static fallback';
        activeGlobe?.pauseAnimation();
    };
    globeAbort = new AbortController();
    const controller = globeAbort;
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
        const res = await fetch('assets/land.json', {signal: controller.signal});
        if (!res.ok) throw new Error('Map geometry unavailable');
        const land = await res.json();
        if (!container.isConnected || controller.signal.aborted) return;
        const markers = [
            {lat:44.4323,lng:26.1063,name:'Bucharest, Romania',label:'Origin IP · 185.220.101.45',color:'#f43f5e',size:0.65},
            {lat:38.9072,lng:-77.0369,name:'Washington DC, USA',label:'Target ingress',color:'#A3CFCD',size:0.5},
            {lat:48.8566,lng:2.3522,name:'Paris, France',label:'Target ingress',color:'#A3CFCD',size:0.5},
            {lat:55.7558,lng:37.6173,name:'Moscow, Russia',label:'Target ingress',color:'#A3CFCD',size:0.5}
        ];
        const arcs = markers.slice(1).map(m => ({startLat:m.lat,startLng:m.lng,endLat:44.4323,endLng:26.1063}));
        const globe = new Globe(container, {animateIn:false})
            .width(container.clientWidth).height(container.clientHeight)
            .backgroundColor('rgba(0,0,0,0)').showAtmosphere(false)
            .polygonsData(land.features || [land])
            .polygonCapColor(() => '#536a78').polygonSideColor(() => '#536a78')
            .polygonStrokeColor(() => '#8da5ad').polygonAltitude(0.002)
            .polygonsTransitionDuration(0)
            .pointsData(markers).pointAltitude(0.02).pointColor('color').pointRadius('size')
            .pointLabel(d => `<div class="globe-tooltip"><b>${d.name}</b><br><span>${d.label}</span></div>`)
            .arcsData(arcs).arcColor(() => ['#A3CFCD','#f43f5e'])
            .arcDashLength(0.45).arcDashGap(0.3).arcDashAnimateTime(reducedMotion() ? 0 : 2400).arcStroke(0.35)
            .ringsData(reducedMotion() ? [] : [markers[0]])
            .ringColor(() => t => `rgba(244,63,94,${1-t})`)
            .ringMaxRadius(6).ringPropagationSpeed(2).ringRepeatPeriod(1200);
        activeGlobe = globe;
        globe.globeMaterial().color.set('#172938');
        globe.controls().autoRotate = !reducedMotion();
        globe.controls().autoRotateSpeed = 0.5;
        globe.controls().enableDamping = true;
        globe.pointOfView({lat:30,lng:5,altitude:2.0},0);
        globe.renderer().setPixelRatio(Math.min(devicePixelRatio, 2));
        const canvas = globe.renderer().domElement;
        canvas.setAttribute('aria-label','Interactive globe with origin attribution routes');
        canvas.addEventListener('webglcontextlost', showFallback);
        const visibility = () => document.hidden ? globe.pauseAnimation() : globe.resumeAnimation();
        document.addEventListener('visibilitychange', visibility);
        globeCleanup = () => {
            canvas.removeEventListener('webglcontextlost', showFallback);
            document.removeEventListener('visibilitychange', visibility);
        };
        globeResizeObserver = new ResizeObserver(entries => {
            const {width,height} = entries[0].contentRect;
            if (width && height) globe.width(width).height(height);
        });
        globeResizeObserver.observe(container);
        fallback.hidden = true;
        mode.textContent = '3D interactive';
    } catch (err) {
        if (container.isConnected) showFallback();
    } finally {
        clearTimeout(timeout);
    }
}

// ===== HELPER FUNCTIONS (Optimized layout - no overflow) =====

function statCard(icon, label, value, trend, trendColor) {
    return `
        <div class="stat-card metric-card flex flex-col justify-between p-3.5 min-w-0">
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
    if (!ctx || typeof Chart === 'undefined') return;
    Chart.getChart(ctx)?.destroy();
    const dark = isDark();

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                { label: 'New Onions', data: [12, 19, 15, 25, 22, 30, 28], borderColor: '#A3CFCD', backgroundColor: 'rgba(163,207,205,0.06)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 },
                { label: 'Threat Actors', data: [8, 12, 10, 18, 15, 22, 25], borderColor: '#82A0AA', tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 },
                { label: 'Infra Probes', data: [5, 8, 6, 12, 10, 15, 12], borderColor: '#677381', tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    display: true, position: 'top', align: 'start', 
                    labels: { boxWidth: 6, usePointStyle: true, pointStyle: 'line', padding: 14, color: dark ? '#94a3b8' : '#64748b', font: { size: 11, family: 'system-ui, sans-serif' } }
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
    if (!ctx || typeof Chart === 'undefined') return;
    Chart.getChart(ctx)?.destroy();
    const dark = isDark();

    const categories = {};
    actors.forEach(a => {
        const cat = (a.category || 'Threat Group').split(' ')[0];
        categories[cat] = (categories[cat] || 0) + 1;
    });

    const labels = Object.keys(categories).length ? Object.keys(categories) : ['Data Broker', 'Ransomware', 'Syndicate', 'APT'];
    const data = Object.values(categories).length ? Object.values(categories) : [2, 1, 1, 1];
    const colors = ['#A3CFCD', '#82A0AA', '#677381', '#82A0AA'];

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
    if (!ctx || typeof Chart === 'undefined') return;
    Chart.getChart(ctx)?.destroy();
    const dark = isDark();

    const labels = actors.map(a => a.primary_handle);
    const data = actors.map(a => a.attribution_confidence);
    const bgColors = data.map(v => v >= 90 ? '#A3CFCD' : v >= 80 ? '#677381' : '#82A0AA');

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
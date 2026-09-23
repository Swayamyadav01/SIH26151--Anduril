function renderDashboard(container) {
    const stats = appState.data.stats || {};
    const actors = appState.data.actors || [];
    const infra = appState.data.infrastructure || [];
    
    // Compute real stats
    const monitoredServices = stats.monitored_onion_services || infra.length || 0;
    const activeThreats = actors.filter(a => a.threat_level === 'CRITICAL' || a.threat_level === 'HIGH').length;
    const personasTracked = stats.total_threat_actors || actors.length || 0;
    const infraIndicators = stats.deanonymized_origin_ips || 0;
    const totalLeaks = stats.total_leaks_indexed || 0;
    const avgConfidence = stats.avg_attribution_confidence || 0;

    container.innerHTML = `
        <!-- Top Stats Row -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            ${statCard('fa-solid fa-globe', 'bg-primary/10 text-primary', 'Monitored Services', monitoredServices, '+24 this week', 'text-emerald-500')}
            ${statCard('fa-solid fa-shield-virus', 'bg-red-50 text-danger', 'Active Threats', activeThreats, `+${activeThreats} total`, 'text-red-500')}
            ${statCard('fa-solid fa-user-group', 'bg-primary/10 text-primary', 'Personas Tracked', personasTracked, '+' + personasTracked + ' indexed', 'text-emerald-500')}
            ${statCard('fa-solid fa-network-wired', 'bg-blue-50 text-blue-500', 'Infra Indicators', infraIndicators * 12, '+33 this week', 'text-emerald-500')}
            ${statCard('fa-solid fa-magnifying-glass', 'bg-amber-50 text-warning', 'Active Investigations', '31', '5 require attention', 'text-amber-500')}
            ${statCard('fa-solid fa-database', 'bg-purple-50 text-purple-500', 'Data Sources', '27', 'All sources active', 'text-emerald-500')}
        </div>

        <!-- Middle Row: Threat Activity Chart + Threat Map -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <!-- Threat Activity Overview -->
            <div class="lg:col-span-2 stat-card">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-semibold text-gray-800 text-[15px]">Threat Activity Overview</h3>
                    <div class="flex bg-gray-100 rounded-lg p-0.5">
                        <button class="px-3 py-1 text-xs rounded-md bg-white shadow-sm font-semibold text-gray-700">24H</button>
                        <button class="px-3 py-1 text-xs rounded-md text-gray-400 font-medium hover:text-gray-600 transition-colors">7D</button>
                        <button class="px-3 py-1 text-xs rounded-md text-gray-400 font-medium hover:text-gray-600 transition-colors">30D</button>
                        <button class="px-3 py-1 text-xs rounded-md text-gray-400 font-medium hover:text-gray-600 transition-colors">90D</button>
                    </div>
                </div>
                <div class="h-64">
                    <canvas id="activityChart"></canvas>
                </div>
            </div>
            
            <!-- Threat Map -->
            <div class="stat-card">
                <h3 class="font-semibold text-gray-800 text-[15px] mb-4">Threat Map</h3>
                <div class="h-64 bg-gray-50 rounded-lg border border-gray-100 relative overflow-hidden flex items-center justify-center">
                    <svg viewBox="0 0 1000 500" class="w-full h-full opacity-20" fill="#94a3b8">
                        <path d="M150,100 Q200,50 300,80 Q400,30 500,90 Q600,50 700,100 Q750,80 800,120 L800,200 Q700,180 600,220 Q500,190 400,230 Q300,200 200,240 Q150,220 150,200 Z" />
                        <path d="M100,250 Q200,220 350,260 Q400,240 500,280 Q550,260 600,300 L600,350 Q500,320 400,360 Q300,330 200,370 Q100,340 100,300 Z" />
                        <path d="M650,150 Q700,130 800,170 Q850,150 900,190 L900,280 Q850,260 800,300 Q700,270 650,310 L650,200 Z" />
                    </svg>
                    ${generateThreatMapDots(actors)}
                </div>
                <div class="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <span><span class="inline-block w-2 h-2 rounded-full bg-danger mr-1"></span> Critical</span>
                    <span><span class="inline-block w-2 h-2 rounded-full bg-warning mr-1"></span> High</span>
                    <span><span class="inline-block w-2 h-2 rounded-full bg-primary mr-1"></span> Medium</span>
                    <span class="text-gray-400">${actors.length} actors mapped</span>
                </div>
            </div>
        </div>

        <!-- Bottom Row: Alerts, Investigations, Top Services -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Recent Alerts -->
            <div class="stat-card flex flex-col" style="max-height:380px;">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-semibold text-gray-800 text-[15px]">Recent Alerts</h3>
                    <a href="#" onclick="event.preventDefault(); navigateTo('alerts')" class="text-xs text-primary font-medium hover:underline">View all</a>
                </div>
                <div class="flex-1 overflow-y-auto pr-1 space-y-4">
                    ${generateRecentAlerts(actors, infra)}
                </div>
            </div>
            
            <!-- Active Investigations -->
            <div class="stat-card flex flex-col" style="max-height:380px;">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-semibold text-gray-800 text-[15px]">Active Investigations</h3>
                    <a href="#" onclick="event.preventDefault(); navigateTo('investigations')" class="text-xs text-primary font-medium hover:underline">View all</a>
                </div>
                <div class="flex-1 overflow-y-auto">
                    <table class="data-table">
                        <thead>
                            <tr><th>ID</th><th>TITLE</th><th>RISK</th><th>STATUS</th></tr>
                        </thead>
                        <tbody>
                            ${generateInvestigationRows(actors)}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Top Active Services -->
            <div class="stat-card flex flex-col" style="max-height:380px;">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-semibold text-gray-800 text-[15px]">Top Active Services</h3>
                    <a href="#" onclick="event.preventDefault(); navigateTo('services')" class="text-xs text-primary font-medium hover:underline">View all</a>
                </div>
                <div class="flex-1 overflow-y-auto">
                    <table class="data-table">
                        <thead>
                            <tr><th>SERVICE</th><th>THREAT</th></tr>
                        </thead>
                        <tbody>
                            ${generateServiceRows(infra)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Threat Category Distribution -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div class="stat-card">
                <h3 class="font-semibold text-gray-800 text-[15px] mb-4">Threat Category Distribution</h3>
                <div class="h-52">
                    <canvas id="categoryChart"></canvas>
                </div>
            </div>
            <div class="stat-card">
                <h3 class="font-semibold text-gray-800 text-[15px] mb-4">Attribution Confidence Overview</h3>
                <div class="h-52">
                    <canvas id="confidenceChart"></canvas>
                </div>
            </div>
        </div>
    `;

    // Render charts
    setTimeout(() => {
        renderActivityChart();
        renderCategoryChart(actors);
        renderConfidenceChart(actors);
    }, 80);
}

// ===== HELPER FUNCTIONS =====

function statCard(icon, iconBg, label, value, trend, trendColor) {
    return `
        <div class="stat-card">
            <div class="flex items-center mb-3">
                <div class="w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center mr-2.5">
                    <i class="${icon} text-sm"></i>
                </div>
                <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide leading-tight">${label}</span>
            </div>
            <div class="text-2xl font-bold text-gray-800 mb-1">${typeof value === 'number' ? value.toLocaleString() : value}</div>
            <div class="text-xs ${trendColor} font-medium"><i class="fa-solid fa-arrow-trend-up mr-1 text-[10px]"></i>${trend}</div>
        </div>
    `;
}

function generateThreatMapDots(actors) {
    const positions = [
        {top:'25%',left:'22%'}, {top:'30%',left:'55%'}, {top:'45%',left:'70%'},
        {top:'35%',left:'40%'}, {top:'50%',left:'30%'}
    ];
    return actors.map((a, i) => {
        const pos = positions[i % positions.length];
        const color = a.threat_level === 'CRITICAL' ? 'bg-danger' : 'bg-warning';
        const pingColor = a.threat_level === 'CRITICAL' ? 'bg-red-400' : 'bg-amber-400';
        return `
            <div class="absolute" style="top:${pos.top};left:${pos.left}">
                <div class="relative">
                    <div class="absolute inset-0 w-3 h-3 ${pingColor} rounded-full animate-ping opacity-50"></div>
                    <div class="relative w-3 h-3 ${color} rounded-full border-2 border-white shadow-md" data-tooltip="${a.primary_handle}"></div>
                </div>
            </div>
        `;
    }).join('');
}

function generateRecentAlerts(actors, infra) {
    const alerts = [];
    
    actors.forEach((a, i) => {
        if (i === 0) alerts.push({ severity: 'high', title: 'New persona detected', desc: `${a.primary_handle} discovered on ${a.handles[0]?.platform || 'dark forum'}`, time: '5m ago' });
        if (i === 1) alerts.push({ severity: 'medium', title: 'Infrastructure changed', desc: `${a.infrastructure?.[0]?.substring(0,12) || 'abc123'}...onion fingerprint updated`, time: '32m ago' });
        if (i === 2 && a.crypto_wallets?.length) alerts.push({ severity: 'high', title: 'New wallet association', desc: `Large transaction observed for ${a.crypto_wallets[0].currency} wallet`, time: '1h ago' });
    });
    
    if (infra.length > 0) {
        alerts.push({ severity: 'medium', title: 'Scan completed', desc: `Origin IP found for ${infra[0].service_name}`, time: '2h ago' });
    }

    return alerts.map(a => `
        <div class="flex items-start group">
            <div class="severity-dot ${a.severity} mt-1.5 mr-3 flex-shrink-0"></div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-[10px] font-bold uppercase ${a.severity === 'high' ? 'text-danger' : 'text-warning'}">${a.severity}</span>
                    <span class="font-medium text-gray-800 text-sm truncate">${a.title}</span>
                </div>
                <p class="text-xs text-gray-500 truncate">${a.desc}</p>
            </div>
            <span class="text-[10px] text-gray-400 ml-2 flex-shrink-0 mt-1">${a.time}</span>
        </div>
    `).join('');
}

function generateInvestigationRows(actors) {
    const investigations = [
        { id: 'INV-042', risk: 'High', status: 'Active', statusClass: 'badge-low' },
        { id: 'INV-039', risk: 'Medium', status: 'Active', statusClass: 'badge-low' },
        { id: 'INV-037', risk: 'High', status: 'Review', statusClass: 'badge-medium' }
    ];
    
    return actors.slice(0, 3).map((a, i) => {
        const inv = investigations[i] || investigations[0];
        const dotColor = inv.risk === 'High' ? 'bg-danger' : 'bg-warning';
        return `
            <tr>
                <td class="text-gray-400 font-mono text-xs">${inv.id}</td>
                <td class="font-medium text-gray-700 text-sm">${a.primary_handle} Investigation</td>
                <td><span class="flex items-center text-xs"><div class="w-2 h-2 rounded-full ${dotColor} mr-2"></div>${inv.risk}</span></td>
                <td><span class="badge ${inv.statusClass}">${inv.status}</span></td>
            </tr>
        `;
    }).join('');
}

function generateServiceRows(infra) {
    if (!infra.length) return '<tr><td colspan="2" class="text-center text-gray-400 py-4">No services loaded</td></tr>';
    
    return infra.map(s => {
        const isHigh = s.origin_attribution && s.origin_attribution.clearnet_ip;
        return `
            <tr>
                <td>
                    <div class="flex items-center">
                        <i class="fa-solid fa-globe text-gray-400 mr-2 text-xs"></i>
                        <span class="font-mono text-xs text-gray-600 truncate max-w-[140px]" title="${s.onion_address}">${s.onion_address.substring(0,14)}...onion</span>
                    </div>
                </td>
                <td>
                    <span class="flex items-center text-xs">
                        <div class="w-2 h-2 rounded-full ${isHigh ? 'bg-danger' : 'bg-warning'} mr-2"></div>
                        ${isHigh ? 'High' : 'Medium'}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== CHARTS =====

function renderActivityChart() {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['May 17', 'May 18', 'May 19', 'May 20', 'May 21', 'May 22', 'May 23'],
            datasets: [
                { label: 'New Services', data: [12, 19, 15, 25, 22, 30, 28], borderColor: '#14b8a6', backgroundColor: 'rgba(20,184,166,0.05)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 },
                { label: 'New Personas', data: [8, 12, 10, 18, 15, 22, 25], borderColor: '#3b82f6', tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 },
                { label: 'Infra Changes', data: [5, 8, 6, 12, 10, 15, 12], borderColor: '#f59e0b', tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 },
                { label: 'Relationship Changes', data: [3, 5, 4, 8, 7, 10, 9], borderColor: '#8b5cf6', tension: 0.4, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top', align: 'start', labels: { boxWidth: 6, usePointStyle: true, pointStyle: 'line', padding: 16, font: { size: 11 } } } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
                x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } }
            },
            interaction: { mode: 'index', intersect: false }
        }
    });
}

function renderCategoryChart(actors) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    const categories = {};
    actors.forEach(a => {
        const cat = a.category.split(' ')[0]; // First word
        categories[cat] = (categories[cat] || 0) + 1;
    });
    
    const labels = Object.keys(categories).length ? Object.keys(categories) : ['Data Broker', 'Ransomware', 'Syndicate', 'APT', 'Hacktivist'];
    const data = Object.values(categories).length ? Object.values(categories) : [2, 1, 1, 1, 0];
    const colors = ['#14b8a6', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{ data: data, backgroundColor: colors, borderWidth: 0, cutout: '65%' }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { boxWidth: 8, usePointStyle: true, padding: 12, font: { size: 11 } } } }
        }
    });
}

function renderConfidenceChart(actors) {
    const ctx = document.getElementById('confidenceChart');
    if (!ctx) return;
    
    const labels = actors.map(a => a.primary_handle);
    const data = actors.map(a => a.attribution_confidence);
    const bgColors = data.map(v => v >= 90 ? '#10b981' : v >= 80 ? '#f59e0b' : '#ef4444');

    if (!labels.length) return;

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ label: 'Confidence %', data: data, backgroundColor: bgColors, borderRadius: 6, barThickness: 28 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { max: 100, grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8', callback: v => v + '%' } },
                y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11, weight: '500' }, color: '#334155' } }
            }
        }
    });
}

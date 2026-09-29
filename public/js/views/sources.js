/**
 * Sources View
 * Displays intelligence data sources with status indicators.
 */
function renderSources(container) {
  const sources = [
    {
      name: 'BreachForums',
      category: 'Forum',
      icon: 'fa-comments',
      description: 'Successor to RaidForums. Major hub for data breaches, combo lists, and cracking tools.',
      status: 'online',
      lastPoll: '2 min ago',
      records: '1.2M',
      reliability: 92,
      url: 'breachforums'
    },
    {
      name: 'XSS.is',
      category: 'Forum',
      icon: 'fa-shield-halved',
      description: 'Russian-language cybercrime forum focused on exploit development, malware, and access brokering.',
      status: 'online',
      lastPoll: '5 min ago',
      records: '485K',
      reliability: 88,
      url: 'xss.is'
    },
    {
      name: 'Exploit.in',
      category: 'Forum',
      icon: 'fa-bug',
      description: 'Elite Russian cybercrime forum specializing in zero-days, exploit kits, and initial access.',
      status: 'online',
      lastPoll: '8 min ago',
      records: '320K',
      reliability: 90,
      url: 'exploit.in'
    },
    {
      name: 'Dread',
      category: 'Forum',
      icon: 'fa-skull',
      description: 'Tor-based Reddit-like forum for darknet market discussions, reviews, and operational security.',
      status: 'degraded',
      lastPoll: '22 min ago',
      records: '780K',
      reliability: 72,
      url: 'dread'
    },
    {
      name: 'Telegram',
      category: 'Messaging',
      icon: 'fa-paper-plane',
      description: 'Monitoring private and public channels for threat intel, data leaks, and actor communications.',
      status: 'online',
      lastPoll: '1 min ago',
      records: '2.4M',
      reliability: 85,
      url: 'telegram'
    },
    {
      name: 'Passive DNS',
      category: 'Technical',
      icon: 'fa-globe',
      description: 'Historical DNS resolution data for tracking infrastructure changes and domain pivoting.',
      status: 'online',
      lastPoll: '30 sec ago',
      records: '18.7M',
      reliability: 97,
      url: 'pdns'
    },
    {
      name: 'Certificate Transparency Logs',
      category: 'Technical',
      icon: 'fa-certificate',
      description: 'Public CT logs for discovering related domains, sub-domains, and certificate anomalies.',
      status: 'online',
      lastPoll: '1 min ago',
      records: '42.3M',
      reliability: 99,
      url: 'ct-logs'
    },
    {
      name: 'Shodan',
      category: 'Scanner',
      icon: 'fa-radar',
      description: 'Internet-wide scan data for identifying exposed services, banners, and device fingerprints.',
      status: 'online',
      lastPoll: '3 min ago',
      records: '6.8M',
      reliability: 94,
      url: 'shodan'
    },
    {
      name: 'FOFA',
      category: 'Scanner',
      icon: 'fa-satellite',
      description: 'Chinese cyberspace search engine for asset mapping, fingerprinting, and attack surface discovery.',
      status: 'degraded',
      lastPoll: '45 min ago',
      records: '3.1M',
      reliability: 78,
      url: 'fofa'
    }
  ];

  const onlineCount = sources.filter(s => s.status === 'online').length;
  const degradedCount = sources.filter(s => s.status === 'degraded').length;
  const offlineCount = sources.filter(s => s.status === 'offline').length;

  const categoryColors = {
    'Forum': 'bg-purple-100 text-purple-700',
    'Messaging': 'bg-blue-100 text-blue-700',
    'Technical': 'bg-teal-100 text-teal-700',
    'Scanner': 'bg-amber-100 text-amber-700',
  };

  const statusConfig = {
    'online': { dot: 'bg-green-400', badge: 'bg-green-100 text-green-700', label: 'Online', pulse: true },
    'degraded': { dot: 'bg-amber-400', badge: 'bg-amber-100 text-amber-700', label: 'Degraded', pulse: false },
    'offline': { dot: 'bg-red-400', badge: 'bg-red-100 text-red-700', label: 'Offline', pulse: false },
  };

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <span class="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 text-teal-600">
            <i class="fa-solid fa-database text-lg"></i>
          </span>
          Intelligence Sources
        </h1>
        <p class="text-gray-500 mt-1 ml-13">Data feeds and collection sources powering the threat intelligence platform.</p>
      </div>

      <!-- Status Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
            <i class="fa-solid fa-circle-check text-green-500 text-sm"></i>
          </div>
          <div>
            <p class="text-xl font-bold text-green-600">${onlineCount}</p>
            <p class="text-xs text-gray-500">Online</p>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
            <i class="fa-solid fa-circle-exclamation text-amber-500 text-sm"></i>
          </div>
          <div>
            <p class="text-xl font-bold text-amber-600">${degradedCount}</p>
            <p class="text-xs text-gray-500">Degraded</p>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
            <i class="fa-solid fa-circle-xmark text-red-500 text-sm"></i>
          </div>
          <div>
            <p class="text-xl font-bold text-red-600">${offlineCount}</p>
            <p class="text-xs text-gray-500">Offline</p>
          </div>
        </div>
      </div>

      <!-- Sources Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${sources.map(src => {
          const sc = statusConfig[src.status] || statusConfig['offline'];
          const catClass = categoryColors[src.category] || 'bg-gray-100 text-gray-600';

          return `
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <i class="fa-solid ${src.icon} text-gray-600"></i>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-gray-800">${src.name}</h3>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${catClass} mt-0.5">${src.category}</span>
                </div>
              </div>
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${sc.badge}">
                <span class="relative flex h-2 w-2">
                  ${sc.pulse ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full ${sc.dot} opacity-75"></span>` : ''}
                  <span class="relative inline-flex rounded-full h-2 w-2 ${sc.dot}"></span>
                </span>
                ${sc.label}
              </span>
            </div>

            <p class="text-xs text-gray-600 leading-relaxed flex-1 mb-4">${src.description}</p>

            <!-- Reliability Bar -->
            <div class="mb-3">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-500">Reliability</span>
                <span class="text-xs font-medium text-gray-700">${src.reliability}%</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-1.5">
                <div class="h-1.5 rounded-full ${src.reliability >= 90 ? 'bg-teal-500' : src.reliability >= 75 ? 'bg-amber-400' : 'bg-red-400'} transition-all" style="width: ${src.reliability}%"></div>
              </div>
            </div>

            <div class="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span><i class="fa-solid fa-database mr-1"></i>${src.records} records</span>
              <span><i class="fa-regular fa-clock mr-1"></i>${src.lastPoll}</span>
            </div>
          </div>`;
        }).join('')}
      </div>

      <!-- Data Pipeline Status -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <i class="fa-solid fa-diagram-project text-teal-500"></i>
          <h2 class="text-sm font-semibold text-gray-800">Collection Pipeline</h2>
        </div>
        <div class="p-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 flex-wrap">
            ${['Crawler', 'Parser', 'Enrichment', 'Indexer', 'Alerting'].map((stage, i) => {
              const stageStatus = i < 4 ? 'running' : 'idle';
              const statusColor = stageStatus === 'running' ? 'text-green-500' : 'text-gray-400';
              const bgColor = stageStatus === 'running' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200';
              return `
              <div class="flex items-center gap-3">
                <div class="flex flex-col items-center">
                  <div class="w-12 h-12 rounded-xl border ${bgColor} flex items-center justify-center">
                    <i class="fa-solid ${['fa-spider', 'fa-code', 'fa-wand-magic-sparkles', 'fa-layer-group', 'fa-bell'][i]} ${statusColor}"></i>
                  </div>
                  <span class="text-xs text-gray-600 mt-1.5 font-medium">${stage}</span>
                  <span class="text-xs ${statusColor}">${stageStatus}</span>
                </div>
                ${i < 4 ? '<i class="fa-solid fa-arrow-right text-gray-300 hidden sm:block"></i>' : ''}
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

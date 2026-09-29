/**
 * Infrastructure View
 * Renders hidden service scanning, de-anonymization results, and infrastructure overview.
 */
function renderInfrastructure(container) {
  const infra = (appState.data && appState.data.infrastructure) || [];

  const totalNodes = infra.length;
  const deanonymized = infra.filter(s => s.origin_attribution?.clearnet_ip || s.deanonymized || s.origin_ip || (s.attribution && s.attribution.ip)).length;
  const activeScans = infra.filter(s => s.status === 'scanning' || s.status === 'active').length;
  const misconfigs = infra.filter(s =>
    (s.vulnerabilities && s.vulnerabilities.length > 0) ||
    (s.misconfigurations && s.misconfigurations.length > 0) ||
    s.misconfigured
  ).length;

  // Build quick-target chips from known addresses
  const knownAddresses = infra
    .filter(s => s.onion_address || s.address || s.url)
    .slice(0, 6)
    .map(s => s.onion_address || s.address || s.url);

  const chipsHTML = knownAddresses.map(addr => {
    const short = addr.length > 28 ? addr.substring(0, 25) + '...' : addr;
    return `<button class="infra-chip px-3 py-1.5 bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600 text-xs font-mono rounded-full border border-gray-200 hover:border-teal-300 transition-all cursor-pointer whitespace-nowrap" data-address="${addr}" title="${addr}">${short}</button>`;
  }).join('');

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <span class="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 text-teal-600">
            <i class="fa-solid fa-server text-lg"></i>
          </span>
          Infrastructure
        </h1>

      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Nodes</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">${totalNodes}</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <i class="fa-solid fa-network-wired text-blue-500"></i>
            </div>
          </div>

        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">De-Anonymized</p>
              <p class="text-2xl font-bold text-red-600 mt-1">${deanonymized}</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <i class="fa-solid fa-crosshairs text-red-500"></i>
            </div>
          </div>

        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Scans</p>
              <p class="text-2xl font-bold text-teal-600 mt-1">${activeScans}</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
              <i class="fa-solid fa-radar text-teal-500"></i>
            </div>
          </div>

        </div>
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Misconfigurations</p>
              <p class="text-2xl font-bold text-amber-600 mt-1">${misconfigs}</p>
            </div>
            <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <i class="fa-solid fa-triangle-exclamation text-amber-500"></i>
            </div>
          </div>

        </div>
      </div>

      <!-- Scanner Section -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <i class="fa-solid fa-satellite-dish text-teal-500"></i>
          <h2 class="text-sm font-semibold text-gray-800">Service Scanner</h2>
        </div>
        <div class="p-6 space-y-4">
          <!-- Input Row -->
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1 relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <i class="fa-solid fa-globe"></i>
              </span>
              <input
                id="infra-scan-input"
                type="text"
                placeholder="Enter .onion address (e.g., abc123def456.onion)"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
              />
            </div>
            <button
              id="infra-btn-passive"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all"
            >
              <i class="fa-solid fa-shield-halved"></i>
              Run Passive Scan
            </button>
            <button
              id="infra-btn-active"
              class="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all"
            >
              <i class="fa-solid fa-bolt"></i>
              Run Active Scan
            </button>
          </div>

          <!-- Quick Targets -->
          ${knownAddresses.length > 0 ? `
          <div>
            <p class="text-xs font-medium text-gray-500 mb-2">Quick targets:</p>
            <div class="flex flex-wrap gap-2">
              ${chipsHTML}
            </div>
          </div>
          ` : ''}

          <!-- Terminal Output -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <div class="flex gap-1.5">
                <span class="w-3 h-3 rounded-full bg-red-400"></span>
                <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                <span class="w-3 h-3 rounded-full bg-green-400"></span>
              </div>
              <span class="text-xs text-gray-500 font-mono">scan_output</span>
            </div>
            <div
              id="infra-terminal"
              class="bg-gray-900 rounded-lg p-4 h-56 overflow-y-auto font-mono text-xs leading-relaxed"
            >
              <p class="text-gray-500">$ Awaiting scan target...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Section -->
      <div id="infra-results" class="space-y-4 hidden">
        <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i class="fa-solid fa-file-shield text-teal-500"></i>
          Scan Results
        </h2>
        <div id="infra-results-content" class="grid grid-cols-1 lg:grid-cols-3 gap-4"></div>
      </div>

      <!-- Infrastructure Table -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-list text-teal-500"></i>
            <h2 class="text-sm font-semibold text-gray-800">Tracked Services</h2>
          </div>
          <span class="text-xs text-gray-400">${totalNodes} entries</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-left">
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title / Type</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                <th class="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${infra.length === 0 ? `
              <tr><td colspan="5" class="px-6 py-8 text-center text-gray-400 text-sm">No infrastructure data available</td></tr>
              ` : infra.slice(0, 20).map(s => {
                const addr = s.onion_address || s.address || s.url || 'N/A';
                const shortAddr = addr.length > 30 ? addr.substring(0, 27) + '...' : addr;
                const title = s.title || s.type || s.category || '—';
                const status = s.status || 'unknown';
                const statusColors = {
                  'online': 'bg-green-100 text-green-700',
                  'active': 'bg-green-100 text-green-700',
                  'offline': 'bg-red-100 text-red-700',
                  'down': 'bg-red-100 text-red-700',
                  'scanning': 'bg-blue-100 text-blue-700',
                  'unknown': 'bg-gray-100 text-gray-600'
                };
                const statusClass = statusColors[status.toLowerCase()] || statusColors['unknown'];
                const origin = (s.attribution && s.attribution.ip) || s.origin_ip || '—';
                const lastSeen = s.last_seen || s.last_checked || '—';
                return `
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-3 font-mono text-xs text-gray-700" title="${addr}">${shortAddr}</td>
                  <td class="px-6 py-3 text-gray-600">${title}</td>
                  <td class="px-6 py-3">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass}">${status}</span>
                  </td>
                  <td class="px-6 py-3 font-mono text-xs text-gray-600">${origin}</td>
                  <td class="px-6 py-3 text-xs text-gray-500">${lastSeen}</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // ── Event Wiring ──

  const input = document.getElementById('infra-scan-input');
  const terminal = document.getElementById('infra-terminal');
  const resultsSection = document.getElementById('infra-results');
  const resultsContent = document.getElementById('infra-results-content');

  if (appState.selection?.scanner) input.focus();

  // Quick-target chip clicks
  document.querySelectorAll('.infra-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      input.value = chip.dataset.address;
    });
  });

  function termLog(text, color = 'text-green-400') {
    const line = document.createElement('p');
    line.className = color;
    line.textContent = text;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function clearTerminal() {
    terminal.innerHTML = '';
  }

  function setButtonsDisabled(disabled) {
    if (!container.isConnected) return;
    const btnPassive = document.getElementById('infra-btn-passive');
    const btnActive = document.getElementById('infra-btn-active');
    if (disabled) {
      btnPassive.disabled = true;
      btnActive.disabled = true;
      btnPassive.classList.add('opacity-50', 'cursor-not-allowed');
      btnActive.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      btnPassive.disabled = false;
      btnActive.disabled = false;
      btnPassive.classList.remove('opacity-50', 'cursor-not-allowed');
      btnActive.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }

  async function runScan(type) {
    const target = input.value.trim();
    if (!target) {
      termLog('✗ Error: Please enter an .onion address.', 'text-red-400');
      return;
    }

    const endpoint = type === 'active' ? '/api/scan/active' : '/api/scan';
    const label = type === 'active' ? 'ACTIVE' : 'PASSIVE';

    clearTerminal();
    setButtonsDisabled(true);
    resultsSection.classList.add('hidden');

    termLog(`$ Initiating ${label} scan...`, 'text-teal-400');
    termLog(`  Target: ${target}`, 'text-gray-400');
    termLog('', 'text-gray-500');

    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onion_address: target })
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);

      const data = await resp.json();
      if (!container.isConnected) return;

      termLog('[✓] Scan complete. Processing results...', 'text-teal-400');
      termLog('', 'text-gray-500');
      termLog(`$ Results received: ${JSON.stringify(data).substring(0, 120)}...`, 'text-gray-500');

      displayResults(data, target, label);
    } catch (err) {
      termLog(`[✗] Scan failed: ${err.message}`, 'text-red-400');
      termLog('[*] The backend API may be unavailable. Check server logs.', 'text-amber-400');
    } finally {
      setButtonsDisabled(false);
    }
  }

  function displayResults(data, target, scanType) {
    resultsSection.classList.remove('hidden');

    const attribution = data.origin_attribution || data.attribution || data.origin || {};
    const ip = attribution.clearnet_ip || attribution.ip || data.origin_ip || data.ip || '—';
    const country = attribution.country || data.country || '—';
    const isp = attribution.isp || data.isp || attribution.hosting || '—';
    const confidence = attribution.confidence_score ?? attribution.confidence ?? data.confidence ?? 'N/A';
    const confNum = typeof confidence === 'number' ? confidence : parseInt(confidence) || 0;
    const confColor = confNum >= 80 ? 'text-red-600' : confNum >= 50 ? 'text-amber-600' : 'text-gray-600';

    const vulns = data.misconfigurations || data.vulns || data.vulnerabilities || data.findings || [];
    const evidence = data.evidence || data.origin_attribution?.matching_indicators || data.technical_details || data.details || data.vulns?.map(v => v.evidence) || {};

    resultsContent.innerHTML = `
      <!-- Attribution Card -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 class="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <i class="fa-solid fa-crosshairs text-red-500"></i>
          Origin Attribution
        </h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500">IP Address</span>
            <span class="font-mono text-sm font-medium text-gray-800">${ip}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500">Country</span>
            <span class="text-sm text-gray-700">${country}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500">ISP / Hosting</span>
            <span class="text-sm text-gray-700">${isp}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500">Confidence</span>
            <span class="text-sm font-bold ${confColor}">${typeof confidence === 'number' ? confidence + '%' : confidence}</span>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-gray-100">
          <p class="text-xs text-gray-400">Scan type: <span class="font-medium text-gray-600">${scanType}</span></p>
          <p class="text-xs text-gray-400">Target: <span class="font-mono text-gray-600">${target.length > 30 ? target.substring(0, 27) + '...' : target}</span></p>
        </div>
      </div>

      <!-- Vulnerabilities Card -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 class="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <i class="fa-solid fa-bug text-amber-500"></i>
          Vulnerabilities
          <span class="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${vulns.length}</span>
        </h3>
        ${vulns.length === 0 ? `
          <p class="text-sm text-gray-400 text-center py-4">No vulnerabilities detected</p>
        ` : `
          <div class="space-y-2 max-h-48 overflow-y-auto">
            ${vulns.map(v => {
              const name = typeof v === 'string' ? v : (v.name || v.title || v.type || v.id || 'Finding');
              const severity = typeof v === 'object' ? (v.severity || v.risk || 'info') : 'info';
              const sevColors = {
                'critical': 'bg-red-100 text-red-700 border-red-200',
                'high': 'bg-orange-100 text-orange-700 border-orange-200',
                'medium': 'bg-amber-100 text-amber-700 border-amber-200',
                'low': 'bg-blue-100 text-blue-700 border-blue-200',
                'info': 'bg-gray-100 text-gray-600 border-gray-200'
              };
              const sevClass = sevColors[severity.toLowerCase()] || sevColors['info'];
              const desc = typeof v === 'object' ? (v.description || '') : '';
              return `
              <div class="flex items-start gap-2 p-2 rounded-lg bg-gray-50">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${sevClass} shrink-0 mt-0.5">${severity.toUpperCase()}</span>
                <div>
                  <p class="text-sm font-medium text-gray-700">${name}</p>
                  ${desc ? `<p class="text-xs text-gray-500 mt-0.5">${desc}</p>` : ''}
                </div>
              </div>`;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Evidence Card -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 class="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <i class="fa-solid fa-microscope text-teal-500"></i>
          Technical Evidence
        </h3>
        <div class="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400 overflow-auto max-h-52">
          <pre class="whitespace-pre-wrap">${typeof evidence === 'string' ? evidence : JSON.stringify(evidence, null, 2)}</pre>
        </div>
      </div>
    `;
  }

  // Button event listeners
  document.getElementById('infra-btn-passive').addEventListener('click', () => runScan('passive'));
  document.getElementById('infra-btn-active').addEventListener('click', () => runScan('active'));
}

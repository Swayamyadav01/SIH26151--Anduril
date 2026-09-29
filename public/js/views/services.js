/**
 * Services View – Dark Web Threat Intelligence Dashboard
 * Renders the hidden-services / infrastructure page.
 *
 * Depends on:
 *   - appState.data.infrastructure  (array of service objects)
 *   - Tailwind CSS utility classes + project design tokens
 *   - Font Awesome 6.4 icons
 */

function renderServices(container) {
  const services = (appState.data && appState.data.infrastructure) || [];

  /* ── Derived stats ─────────────────────────────────────── */
  const totalServices    = services.length;
  const activeServices   = services.filter(s => s.status === 'ACTIVE').length;
  const compromised      = services.filter(s => s.origin_attribution && s.origin_attribution.clearnet_ip).length;
  const totalMisconfigs  = services.reduce((sum, s) => sum + ((s.misconfigurations && s.misconfigurations.length) || 0), 0);

  /* ── Helpers ───────────────────────────────────────────── */
  function truncateOnion(addr, maxLen) {
    maxLen = maxLen || 24;
    if (!addr) return '—';
    return addr.length > maxLen ? addr.slice(0, maxLen) + '…' : addr;
  }

  function statusBadge(status) {
    const s = (status || '').toUpperCase();
    if (s === 'ACTIVE')   return '<span class="badge badge-low">ACTIVE</span>';
    if (s === 'INACTIVE') return '<span class="badge badge-medium">INACTIVE</span>';
    return '<span class="badge">' + s + '</span>';
  }

  function severityBadge(sev) {
    const s = (sev || '').toUpperCase();
    if (s === 'CRITICAL') return '<span class="badge badge-high">CRITICAL</span>';
    if (s === 'HIGH')     return '<span class="badge badge-high">HIGH</span>';
    if (s === 'MEDIUM')   return '<span class="badge badge-medium">MEDIUM</span>';
    return '<span class="badge badge-low">' + (sev || 'LOW') + '</span>';
  }

  function confidenceBar(score) {
    if (score == null) return '—';
    const pct   = Math.min(Math.max(score, 0), 100);
    const color = pct >= 80 ? 'bg-red-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-teal-500';
    return '<div class="flex items-center gap-2">' +
             '<div class="w-24 h-2 rounded-full bg-gray-200 overflow-hidden">' +
               '<div class="h-full rounded-full ' + color + '" style="width:' + pct + '%"></div>' +
             '</div>' +
             '<span class="text-xs font-semibold text-gray-600">' + pct.toFixed(1) + '%</span>' +
           '</div>';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Build table rows ──────────────────────────────────── */
  function buildRows(list) {
    if (!list.length) {
      return '<tr><td colspan="8" class="text-center py-10 text-gray-400">' +
               '<i class="fa-solid fa-ghost text-3xl mb-2"></i>' +
               '<p class="mt-2">No services match your query.</p>' +
             '</td></tr>';
    }
    return list.map(function (svc, idx) {
      var origin = svc.origin_attribution || {};
      return '<tr class="hover:bg-gray-50 transition-colors cursor-default">' +
        '<td class="px-4 py-3 font-medium text-gray-800">' + escapeHtml(svc.service_name) + '</td>' +
        '<td class="px-4 py-3"><code class="text-xs bg-gray-100 rounded px-2 py-1 font-mono text-teal-700" title="' + escapeHtml(svc.onion_address) + '">' + escapeHtml(truncateOnion(svc.onion_address)) + '</code></td>' +
        '<td class="px-4 py-3">' + statusBadge(svc.status) + '</td>' +
        '<td class="px-4 py-3 text-center font-mono text-sm">' + (svc.port != null ? svc.port : '—') + '</td>' +
        '<td class="px-4 py-3 text-center">' +
          '<span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ' +
            ((svc.misconfigurations && svc.misconfigurations.length) ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500') + '">' +
            ((svc.misconfigurations && svc.misconfigurations.length) || 0) +
          '</span>' +
        '</td>' +
        '<td class="px-4 py-3 font-mono text-xs">' + (origin.clearnet_ip || '<span class="text-gray-400">N/A</span>') + '</td>' +
        '<td class="px-4 py-3">' + confidenceBar(origin.confidence_score) + '</td>' +
        '<td class="px-4 py-3 text-right">' +
          '<button class="svc-view-btn text-xs font-semibold text-teal-600 hover:text-teal-800 border border-teal-300 rounded-lg px-3 py-1.5 hover:bg-teal-50 transition-colors" data-idx="' + idx + '">' +
            '<i class="fa-solid fa-eye mr-1"></i>View' +
          '</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  }

  /* ── Build detail panel ────────────────────────────────── */
  function buildDetailPanel(svc) {
    var origin  = svc.origin_attribution || {};
    var misconf = svc.misconfigurations  || [];

    var miscCards = misconf.length
      ? misconf.map(function (m) {
          return '<div class="bg-white rounded-lg border border-border-color p-4 shadow-sm">' +
            '<div class="flex items-start justify-between mb-2">' +
              '<h4 class="font-semibold text-gray-800 text-sm">' + escapeHtml(m.title || m.name || 'Misconfiguration') + '</h4>' +
              severityBadge(m.severity) +
            '</div>' +
            '<p class="text-xs text-gray-500 leading-relaxed">' + escapeHtml(m.description || 'No description available.') + '</p>' +
          '</div>';
        }).join('')
      : '<p class="text-sm text-gray-400 italic">No misconfigurations detected.</p>';

    var originSection = origin.clearnet_ip
      ? '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">' +
          detailField('Clearnet IP',  origin.clearnet_ip) +
          detailField('Hostname',     origin.hostname) +
          detailField('Country',      origin.country) +
          detailField('ISP',          origin.isp) +
          detailField('Confidence',   origin.confidence_score != null ? origin.confidence_score.toFixed(1) + '%' : '—') +
        '</div>' +
        (origin.matching_indicators && origin.matching_indicators.length
          ? '<div class="mt-4"><h4 class="text-sm font-semibold text-gray-700 mb-2">Matching Indicators</h4>' +
            '<div class="flex flex-wrap gap-2">' +
              origin.matching_indicators.map(function (ind) {
                return '<span class="inline-block text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-3 py-1">' + escapeHtml(typeof ind === 'string' ? ind : ind.type || JSON.stringify(ind)) + '</span>';
              }).join('') +
            '</div></div>'
          : '')
      : '<p class="text-sm text-gray-400 italic">No origin attribution data available.</p>';

    return '<div id="svc-detail-panel" class="fade-in bg-surface rounded-xl shadow-sm border border-border-color p-6 mt-6">' +
      /* Close button */
      '<div class="flex items-center justify-between mb-5">' +
        '<h3 class="text-lg font-bold text-gray-800"><i class="fa-solid fa-server text-teal-500 mr-2"></i>' + escapeHtml(svc.service_name) + '</h3>' +
        '<button id="svc-detail-close" class="text-gray-400 hover:text-gray-600 transition-colors"><i class="fa-solid fa-xmark text-lg"></i></button>' +
      '</div>' +

      /* Service details grid */
      '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">' +
        detailField('Onion Address', svc.onion_address, true) +
        detailField('Status',        svc.status) +
        detailField('Port',          svc.port) +
        detailField('Actor ID',      svc.associated_actor_id) +
        detailField('Last Scanned',  svc.scan_date ? new Date(svc.scan_date).toLocaleString() : '—') +
      '</div>' +

      /* Misconfigurations */
      '<div class="mb-6">' +
        '<h3 class="text-base font-bold text-gray-800 mb-3"><i class="fa-solid fa-triangle-exclamation text-amber-500 mr-2"></i>Misconfigurations <span class="text-sm font-normal text-gray-400">(' + misconf.length + ')</span></h3>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">' + miscCards + '</div>' +
      '</div>' +

      /* Origin Attribution */
      '<div>' +
        '<h3 class="text-base font-bold text-gray-800 mb-3"><i class="fa-solid fa-crosshairs text-red-500 mr-2"></i>Origin Attribution</h3>' +
        originSection +
      '</div>' +
    '</div>';
  }

  function detailField(label, value, mono) {
    return '<div>' +
      '<p class="text-xs text-gray-400 uppercase tracking-wide mb-1">' + escapeHtml(label) + '</p>' +
      '<p class="text-sm font-medium text-gray-800' + (mono ? ' font-mono break-all' : '') + '">' + escapeHtml(value != null ? String(value) : '—') + '</p>' +
    '</div>';
  }

  /* ── Main HTML ─────────────────────────────────────────── */
  container.innerHTML =
    '<div class="fade-in space-y-6">' +

      /* ── Header ───────────────────────────────────────── */
      '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">' +
        '<div>' +
          '<h1 class="text-2xl font-bold text-gray-800"><i class="fa-solid fa-globe text-teal-500 mr-2"></i>Dark Web Services</h1>' +
          '<p class="text-sm text-gray-500 mt-1">Monitor hidden services, detect misconfigurations, and track origin attribution across the Tor network.</p>' +
        '</div>' +
        '<button id="svc-scan-btn" class="bg-primary hover:bg-teal-600 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors whitespace-nowrap">' +
          '<i class="fa-solid fa-satellite-dish mr-2"></i>Scan New Service' +
        '</button>' +
      '</div>' +

      /* ── Summary stat cards ───────────────────────────── */
      '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">' +
        statCard('fa-server',              'Total Services',          totalServices,   'text-teal-500',   'bg-teal-50') +
        statCard('fa-signal',              'Active Services',         activeServices,  'text-green-500',  'bg-green-50') +
        statCard('fa-crosshairs',          'Compromised',             compromised,     'text-red-500',    'bg-red-50') +
        statCard('fa-triangle-exclamation', 'Misconfigurations Found', totalMisconfigs, 'text-amber-500',  'bg-amber-50') +
      '</div>' +

      /* ── Search / filter bar ──────────────────────────── */
      '<div class="bg-surface rounded-xl shadow-sm border border-border-color p-4 flex flex-col sm:flex-row gap-3">' +
        '<div class="relative flex-1">' +
          '<i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>' +
          '<input id="svc-search" type="text" placeholder="Search by service name, onion address, or IP…" class="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent bg-white" />' +
        '</div>' +
        '<select id="svc-status-filter" class="px-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white">' +
          '<option value="">All Statuses</option>' +
          '<option value="ACTIVE">Active</option>' +
          '<option value="INACTIVE">Inactive</option>' +
        '</select>' +
      '</div>' +

      /* ── Data table ───────────────────────────────────── */
      '<div class="bg-surface rounded-xl shadow-sm border border-border-color overflow-x-auto">' +
        '<table class="data-table w-full text-sm text-left">' +
          '<thead>' +
            '<tr class="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-border-color">' +
              '<th class="px-4 py-3">Service Name</th>' +
              '<th class="px-4 py-3">Onion Address</th>' +
              '<th class="px-4 py-3">Status</th>' +
              '<th class="px-4 py-3 text-center">Port</th>' +
              '<th class="px-4 py-3 text-center">Misconfigs</th>' +
              '<th class="px-4 py-3">Origin IP</th>' +
              '<th class="px-4 py-3">Confidence</th>' +
              '<th class="px-4 py-3 text-right">Actions</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody id="svc-table-body">' +
            buildRows(services) +
          '</tbody>' +
        '</table>' +
      '</div>' +

      /* ── Detail panel placeholder ─────────────────────── */
      '<div id="svc-detail-container"></div>' +

    '</div>';

  /* ── Interactivity ─────────────────────────────────────── */
  var filteredServices = services.slice();

  function applyFilters() {
    var query  = (document.getElementById('svc-search').value || '').toLowerCase();
    var status = (document.getElementById('svc-status-filter').value || '').toUpperCase();

    filteredServices = services.filter(function (svc) {
      var origin = svc.origin_attribution || {};
      var matchesSearch = !query ||
        (svc.service_name   || '').toLowerCase().indexOf(query) !== -1 ||
        (svc.onion_address  || '').toLowerCase().indexOf(query) !== -1 ||
        (origin.clearnet_ip || '').toLowerCase().indexOf(query) !== -1;

      var matchesStatus = !status || (svc.status || '').toUpperCase() === status;

      return matchesSearch && matchesStatus;
    });

    document.getElementById('svc-table-body').innerHTML = buildRows(filteredServices);
    attachViewHandlers();
  }

  function attachViewHandlers() {
    var btns = container.querySelectorAll('.svc-view-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-idx'), 10);
        var svc = filteredServices[idx];
        if (!svc) return;

        var detailContainer = document.getElementById('svc-detail-container');
        detailContainer.innerHTML = buildDetailPanel(svc);

        /* Scroll into view */
        detailContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

        /* Close button */
        document.getElementById('svc-detail-close').addEventListener('click', function () {
          detailContainer.innerHTML = '';
        });
      });
    });
  }

  /* Search & filter listeners */
  var searchInput  = document.getElementById('svc-search');
  var statusFilter = document.getElementById('svc-status-filter');
  if (searchInput)  searchInput.addEventListener('input', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);

  /* Scan button */
  var scanBtn = document.getElementById('svc-scan-btn');
  if (scanBtn) {
    scanBtn.addEventListener('click', function () {
      var addr = prompt('Enter .onion address to scan:');
      if (!addr || !addr.trim()) return;

      scanBtn.disabled = true;
      scanBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Scanning…';

      fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onion_address: addr.trim() })
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        scanBtn.disabled = false;
        scanBtn.innerHTML = '<i class="fa-solid fa-satellite-dish mr-2"></i>Scan New Service';
        alert('Scan initiated for ' + addr.trim() + '. Results will appear shortly.');
      })
      .catch(function (err) {
        scanBtn.disabled = false;
        scanBtn.innerHTML = '<i class="fa-solid fa-satellite-dish mr-2"></i>Scan New Service';
        alert('Scan failed: ' + err.message);
      });
    });
  }

  /* Initial view button wiring */
  attachViewHandlers();
}

/* ── Stat card helper (module-level so it stays lean) ──── */
function statCard(icon, label, value, iconColor, bgColor) {
  return '<div class="bg-surface rounded-xl shadow-sm border border-border-color p-5 flex items-center gap-4">' +
    '<div class="w-12 h-12 rounded-lg flex items-center justify-center ' + bgColor + '">' +
      '<i class="fa-solid ' + icon + ' text-xl ' + iconColor + '"></i>' +
    '</div>' +
    '<div>' +
      '<p class="text-2xl font-bold text-gray-800">' + value + '</p>' +
      '<p class="text-xs text-gray-500 mt-0.5">' + label + '</p>' +
    '</div>' +
  '</div>';
}

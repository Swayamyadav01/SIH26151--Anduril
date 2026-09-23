/**
 * Reports & Exports View
 * Renders export cards (CSV, JSON, PDF/Print) and a table of generated reports.
 */

function renderReports(container) {
  // ── Helper: trigger a file download from in-memory content ──
  function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── CSV generation from appState.data.actors ──
  function generateCSV() {
    const actors  = (appState && appState.data && appState.data.actors) || [];
    const headers = ['ID', 'Handle', 'Category', 'Threat Level', 'Confidence', 'Origin IP', 'Location'];
    const rows    = actors.map(a => [
      a.id          ?? '',
      a.handle      ?? '',
      a.category    ?? '',
      a.threatLevel ?? a.threat_level ?? '',
      a.confidence  ?? '',
      a.originIp    ?? a.origin_ip    ?? '',
      a.location    ?? ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

    return [headers.join(','), ...rows].join('\r\n');
  }

  // ── JSON generation from appState.data.actors ──
  function generateJSON() {
    const actors = (appState && appState.data && appState.data.actors) || [];
    return JSON.stringify(actors, null, 2);
  }

  // ── Sample generated-reports data ──
  const recentReports = [
    { id: 'RPT-2026-0047', title: 'Q3 Threat Actor Dossier',        type: 'Threat Dossier',       date: '2026-09-23', status: 'Complete'    },
    { id: 'RPT-2026-0046', title: 'Hidden Service Infra Audit',     type: 'Infrastructure Audit', date: '2026-09-21', status: 'Complete'    },
    { id: 'RPT-2026-0045', title: 'Persona Cluster – "spectr3"',    type: 'Persona Profile',      date: '2026-09-19', status: 'Complete'    },
    { id: 'RPT-2026-0044', title: 'Marketplace Vendor Correlation',  type: 'Threat Dossier',       date: '2026-09-17', status: 'Processing' },
    { id: 'RPT-2026-0043', title: 'Tor Exit-Node Fingerprinting',   type: 'Infrastructure Audit', date: '2026-09-15', status: 'Complete'    },
  ];

  // ── Status badge colours ──
  function statusBadge(status) {
    if (status === 'Complete') {
      return '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><i class="fa-solid fa-circle-check text-[10px]"></i> Complete</span>';
    }
    return '<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"><i class="fa-solid fa-spinner fa-spin text-[10px]"></i> Processing</span>';
  }

  // ── Type badge ──
  function typeBadge(type) {
    const map = {
      'Threat Dossier':       'bg-red-100 text-red-700',
      'Infrastructure Audit': 'bg-sky-100 text-sky-700',
      'Persona Profile':      'bg-violet-100 text-violet-700',
    };
    const cls = map[type] || 'bg-gray-100 text-gray-700';
    return `<span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}">${type}</span>`;
  }

  // ── Render ──
  container.innerHTML = `
    <!-- ═══════ Header ═══════ -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-heading">
        <i class="fa-solid fa-file-export mr-2 text-teal-500"></i>Reports &amp; Exports
      </h1>
      <p class="mt-1 text-sm text-muted">Generate, download, and manage intelligence reports and data exports.</p>
    </div>

    <!-- ═══════ Export Cards Grid ═══════ -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

      <!-- CSV Export -->
      <div class="bg-surface rounded-xl shadow-sm border border-border-color p-6 flex flex-col items-center text-center">
        <div class="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
          <i class="fa-solid fa-file-csv text-2xl text-emerald-600"></i>
        </div>
        <h3 class="text-base font-semibold text-heading mb-1">CSV Export</h3>
        <p class="text-sm text-muted mb-5 leading-relaxed">Download threat-actor data as a comma-separated values file for spreadsheet analysis.</p>
        <button id="btn-download-csv"
          class="mt-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2">
          <i class="fa-solid fa-download text-xs"></i> Download CSV
        </button>
      </div>

      <!-- JSON Export -->
      <div class="bg-surface rounded-xl shadow-sm border border-border-color p-6 flex flex-col items-center text-center">
        <div class="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
          <i class="fa-solid fa-file-code text-2xl text-violet-600"></i>
        </div>
        <h3 class="text-base font-semibold text-heading mb-1">JSON Export</h3>
        <p class="text-sm text-muted mb-5 leading-relaxed">Export the full threat-actor dataset as structured JSON for programmatic ingestion.</p>
        <button id="btn-download-json"
          class="mt-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2">
          <i class="fa-solid fa-download text-xs"></i> Download JSON
        </button>
      </div>

      <!-- PDF / Print Report -->
      <div class="bg-surface rounded-xl shadow-sm border border-border-color p-6 flex flex-col items-center text-center">
        <div class="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center mb-4">
          <i class="fa-solid fa-file-pdf text-2xl text-red-600"></i>
        </div>
        <h3 class="text-base font-semibold text-heading mb-1">PDF Report</h3>
        <p class="text-sm text-muted mb-5 leading-relaxed">Generate a printable intelligence brief suitable for distribution and archival.</p>
        <button id="btn-print-report"
          class="mt-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2">
          <i class="fa-solid fa-print text-xs"></i> Print Report
        </button>
      </div>
    </div>

    <!-- ═══════ Generated Reports Table ═══════ -->
    <div class="bg-surface rounded-xl shadow-sm border border-border-color">
      <div class="px-6 py-4 border-b border-border-color flex items-center justify-between">
        <h2 class="text-base font-semibold text-heading">
          <i class="fa-solid fa-clock-rotate-left mr-2 text-teal-500"></i>Generated Reports
        </h2>
        <span class="text-xs text-muted">${recentReports.length} reports</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead>
            <tr class="text-xs uppercase tracking-wider text-muted border-b border-border-color">
              <th class="px-6 py-3 font-semibold">Report ID</th>
              <th class="px-6 py-3 font-semibold">Title</th>
              <th class="px-6 py-3 font-semibold">Type</th>
              <th class="px-6 py-3 font-semibold">Generated</th>
              <th class="px-6 py-3 font-semibold">Status</th>
              <th class="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-color">
            ${recentReports.map(r => `
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 font-mono text-xs text-teal-600 whitespace-nowrap">${r.id}</td>
                <td class="px-6 py-4 font-medium text-heading whitespace-nowrap">${r.title}</td>
                <td class="px-6 py-4 whitespace-nowrap">${typeBadge(r.type)}</td>
                <td class="px-6 py-4 text-muted whitespace-nowrap">${r.date}</td>
                <td class="px-6 py-4 whitespace-nowrap">${statusBadge(r.status)}</td>
                <td class="px-6 py-4 text-right whitespace-nowrap">
                  <button class="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors mr-3">
                    <i class="fa-solid fa-eye"></i> View
                  </button>
                  <button class="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors">
                    <i class="fa-solid fa-download"></i> Download
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // ── Wire up buttons ──
  document.getElementById('btn-download-csv').addEventListener('click', () => {
    const csv = generateCSV();
    downloadFile('threat_actors_export.csv', csv, 'text/csv;charset=utf-8;');
  });

  document.getElementById('btn-download-json').addEventListener('click', () => {
    const json = generateJSON();
    downloadFile('threat_actors_export.json', json, 'application/json');
  });

  document.getElementById('btn-print-report').addEventListener('click', () => {
    window.print();
  });
}

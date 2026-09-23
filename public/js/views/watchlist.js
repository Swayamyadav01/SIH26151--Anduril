/**
 * Watchlist View
 * Shows monitored threat entities with add/remove functionality (local state only).
 */

// Persistent watchlist state across re-renders
if (!window._watchlistState) {
  window._watchlistState = {
    initialized: false,
    items: []
  };
}

function renderWatchlist(container) {
  const wl = window._watchlistState;

  // Pre-populate with actors on first load
  if (!wl.initialized) {
    const actors = (appState.data && appState.data.actors) || [];
    wl.items = actors.slice(0, 4).map((a, i) => ({
      id: a.id || `wl-${i}`,
      name: a.name || a.alias || 'Unknown Actor',
      type: a.type || 'Threat Actor',
      threat_level: a.threat_level || a.risk_level || 'medium',
      description: a.description || a.bio || '',
      aliases: a.aliases || [],
      added_at: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
      alerts: Math.floor(Math.random() * 8),
      status: ['active', 'dormant', 'active', 'active'][i] || 'active'
    }));
    wl.initialized = true;
  }

  function render() {
    const activeCount = wl.items.filter(i => i.status === 'active').length;
    const totalAlerts = wl.items.reduce((s, i) => s + (i.alerts || 0), 0);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <span class="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 text-teal-600">
                <i class="fa-solid fa-binoculars text-lg"></i>
              </span>
              Watchlist
            </h1>
            <p class="text-gray-500 mt-1 ml-13">Monitor threat actors and infrastructure of interest.</p>
          </div>
          <button
            id="wl-add-btn"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all self-start"
          >
            <i class="fa-solid fa-plus"></i>
            Add Entity
          </button>
        </div>

        <!-- Stats Bar -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
              <i class="fa-solid fa-eye text-teal-500 text-sm"></i>
            </div>
            <div>
              <p class="text-xl font-bold text-gray-900">${wl.items.length}</p>
              <p class="text-xs text-gray-500">Monitored</p>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <i class="fa-solid fa-signal text-green-500 text-sm"></i>
            </div>
            <div>
              <p class="text-xl font-bold text-gray-900">${activeCount}</p>
              <p class="text-xs text-gray-500">Active Subjects</p>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <i class="fa-solid fa-bell text-red-500 text-sm"></i>
            </div>
            <div>
              <p class="text-xl font-bold text-gray-900">${totalAlerts}</p>
              <p class="text-xs text-gray-500">Pending Alerts</p>
            </div>
          </div>
        </div>

        <!-- Add Entity Modal (hidden by default) -->
        <div id="wl-add-form" class="bg-white rounded-xl border border-teal-200 shadow-sm p-6 hidden">
          <h3 class="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-plus-circle text-teal-500"></i>
            Add New Entity to Watchlist
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Entity Name</label>
              <input id="wl-name" type="text" placeholder="e.g., DarkSide" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select id="wl-type" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="Threat Actor">Threat Actor</option>
                <option value="Ransomware Group">Ransomware Group</option>
                <option value="Hidden Service">Hidden Service</option>
                <option value="Forum">Forum</option>
                <option value="Marketplace">Marketplace</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Threat Level</label>
              <select id="wl-threat" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium" selected>Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
            <input id="wl-notes" type="text" placeholder="Any relevant notes..." class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div class="flex gap-2 mt-4">
            <button id="wl-save-btn" class="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors">
              <i class="fa-solid fa-check mr-1"></i> Add to Watchlist
            </button>
            <button id="wl-cancel-btn" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </div>

        <!-- Watchlist Items -->
        <div id="wl-items" class="space-y-3">
          ${wl.items.length === 0 ? `
            <div class="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div class="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <i class="fa-solid fa-binoculars text-2xl text-gray-400"></i>
              </div>
              <p class="text-gray-500 text-sm">Your watchlist is empty.</p>
              <p class="text-gray-400 text-xs mt-1">Click "Add Entity" to start monitoring threats.</p>
            </div>
          ` : wl.items.map((item, idx) => {
            const threatColors = {
              'critical': 'bg-red-100 text-red-700 border-red-200',
              'high': 'bg-orange-100 text-orange-700 border-orange-200',
              'medium': 'bg-amber-100 text-amber-700 border-amber-200',
              'low': 'bg-blue-100 text-blue-700 border-blue-200',
            };
            const tClass = threatColors[(item.threat_level || '').toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200';
            const statusDot = item.status === 'active' ? 'bg-green-400' : 'bg-gray-400';
            const addedDate = item.added_at ? new Date(item.added_at).toLocaleDateString() : '';

            return `
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <i class="fa-solid fa-user-secret text-gray-600"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="text-sm font-semibold text-gray-800">${item.name}</h3>
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${tClass}">
                      ${(item.threat_level || 'medium').toUpperCase()}
                    </span>
                    <span class="inline-flex items-center gap-1.5 text-xs text-gray-500">
                      <span class="w-2 h-2 rounded-full ${statusDot}"></span>
                      ${item.status || 'unknown'}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 mt-0.5">${item.type}</p>
                  ${item.description ? `<p class="text-xs text-gray-600 mt-2 leading-relaxed">${item.description.length > 150 ? item.description.substring(0, 147) + '...' : item.description}</p>` : ''}
                  <div class="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    ${addedDate ? `<span><i class="fa-regular fa-calendar mr-1"></i>Added ${addedDate}</span>` : ''}
                    ${item.alerts > 0 ? `<span class="text-red-500 font-medium"><i class="fa-solid fa-bell mr-1"></i>${item.alerts} alert${item.alerts !== 1 ? 's' : ''}</span>` : '<span class="text-green-500"><i class="fa-solid fa-check-circle mr-1"></i>No alerts</span>'}
                  </div>
                </div>
                <button class="wl-remove-btn shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" data-index="${idx}" title="Remove from watchlist">
                  <i class="fa-solid fa-trash-can text-sm"></i>
                </button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;

    // ── Event Wiring ──

    // Toggle add form
    document.getElementById('wl-add-btn').addEventListener('click', () => {
      document.getElementById('wl-add-form').classList.toggle('hidden');
    });

    const cancelBtn = document.getElementById('wl-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        document.getElementById('wl-add-form').classList.add('hidden');
      });
    }

    // Save new entity
    const saveBtn = document.getElementById('wl-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const name = document.getElementById('wl-name').value.trim();
        if (!name) return;

        wl.items.push({
          id: 'wl-' + Date.now(),
          name: name,
          type: document.getElementById('wl-type').value,
          threat_level: document.getElementById('wl-threat').value,
          description: document.getElementById('wl-notes').value.trim(),
          aliases: [],
          added_at: new Date().toISOString(),
          alerts: 0,
          status: 'active'
        });

        render();
      });
    }

    // Remove buttons
    document.querySelectorAll('.wl-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        wl.items.splice(idx, 1);
        render();
      });
    });
  }

  render();
}

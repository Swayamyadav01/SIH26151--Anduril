/**
 * Discover / Search View
 * Lets users search across actors and services with a card-grid display.
 */
function renderDiscover(container) {
  container.innerHTML = `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <span class="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-50 text-teal-600">
            <i class="fa-solid fa-magnifying-glass text-lg"></i>
          </span>
          Discover
        </h1>
        <p class="text-gray-500 mt-1 ml-13">Search across threat actors, hidden services, and intelligence data.</p>
      </div>

      <!-- Search Bar -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div class="relative max-w-2xl mx-auto">
          <span class="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
            <i class="fa-solid fa-magnifying-glass"></i>
          </span>
          <input
            id="discover-search"
            type="text"
            placeholder="Search actors, aliases, services, techniques..."
            class="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
          />
          <span id="discover-spinner" class="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hidden">
            <i class="fa-solid fa-spinner fa-spin"></i>
          </span>
        </div>
        <div class="flex flex-wrap gap-2 justify-center mt-4">
          <button class="discover-suggest px-3 py-1 bg-gray-100 hover:bg-teal-50 text-gray-600 hover:text-teal-700 text-xs rounded-full border border-gray-200 hover:border-teal-300 transition-all cursor-pointer" data-query="ransomware">ransomware</button>
          <button class="discover-suggest px-3 py-1 bg-gray-100 hover:bg-teal-50 text-gray-600 hover:text-teal-700 text-xs rounded-full border border-gray-200 hover:border-teal-300 transition-all cursor-pointer" data-query="marketplace">marketplace</button>
          <button class="discover-suggest px-3 py-1 bg-gray-100 hover:bg-teal-50 text-gray-600 hover:text-teal-700 text-xs rounded-full border border-gray-200 hover:border-teal-300 transition-all cursor-pointer" data-query="APT">APT</button>
          <button class="discover-suggest px-3 py-1 bg-gray-100 hover:bg-teal-50 text-gray-600 hover:text-teal-700 text-xs rounded-full border border-gray-200 hover:border-teal-300 transition-all cursor-pointer" data-query="credential">credential</button>
          <button class="discover-suggest px-3 py-1 bg-gray-100 hover:bg-teal-50 text-gray-600 hover:text-teal-700 text-xs rounded-full border border-gray-200 hover:border-teal-300 transition-all cursor-pointer" data-query="forum">forum</button>
        </div>
      </div>

      <!-- Result Stats -->
      <div id="discover-stats" class="hidden">
        <p class="text-sm text-gray-500"></p>
      </div>

      <!-- Results Grid -->
      <div id="discover-results" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>

      <!-- Empty / Default State -->
      <div id="discover-empty" class="text-center py-16">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <i class="fa-solid fa-satellite-dish text-2xl text-gray-400"></i>
        </div>
        <p class="text-gray-500 text-sm">Enter a search query to explore the intelligence database.</p>
        <p class="text-gray-400 text-xs mt-1">Search by name, alias, technique, or keyword.</p>
      </div>
    </div>
  `;

  const searchInput = document.getElementById('discover-search');
  const spinner = document.getElementById('discover-spinner');
  const resultsGrid = document.getElementById('discover-results');
  const statsEl = document.getElementById('discover-stats');
  const emptyEl = document.getElementById('discover-empty');

  let debounceTimer = null;

  function renderResultCards(items, query) {
    if (!items || items.length === 0) {
      resultsGrid.innerHTML = '';
      emptyEl.innerHTML = `
        <div class="text-center py-16">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <i class="fa-solid fa-ghost text-2xl text-gray-400"></i>
          </div>
          <p class="text-gray-500 text-sm">No results found for "<span class="font-medium">${query}</span>"</p>
          <p class="text-gray-400 text-xs mt-1">Try different keywords or broaden your search.</p>
        </div>
      `;
      emptyEl.classList.remove('hidden');
      statsEl.classList.add('hidden');
      return;
    }

    emptyEl.classList.add('hidden');
    statsEl.classList.remove('hidden');
    statsEl.querySelector('p').textContent = `Found ${items.length} result${items.length !== 1 ? 's' : ''} for "${query}"`;

    resultsGrid.innerHTML = items.map(item => {
      const name = item.name || item.alias || item.title || 'Unknown';
      const type = item.type || item.category || item.role || 'Entity';
      const desc = item.description || item.bio || item.summary || '';
      const shortDesc = desc.length > 120 ? desc.substring(0, 117) + '...' : desc;
      const threat = item.threat_level || item.risk_level || item.severity || '';
      const aliases = item.aliases || item.aka || [];

      const threatColors = {
        'critical': 'bg-red-100 text-red-700',
        'high': 'bg-orange-100 text-orange-700',
        'medium': 'bg-amber-100 text-amber-700',
        'low': 'bg-blue-100 text-blue-700',
      };
      const threatClass = threatColors[(threat || '').toLowerCase()] || 'bg-gray-100 text-gray-600';

      const typeIcons = {
        'actor': 'fa-user-secret',
        'threat_actor': 'fa-user-secret',
        'group': 'fa-users',
        'service': 'fa-server',
        'marketplace': 'fa-store',
        'forum': 'fa-comments',
      };
      const icon = typeIcons[(type || '').toLowerCase()] || 'fa-circle-info';

      return `
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <i class="fa-solid ${icon} text-teal-600 text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-gray-800 truncate">${name}</h3>
              <p class="text-xs text-gray-500 mt-0.5">${type}</p>
            </div>
            ${threat ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${threatClass} shrink-0">${threat}</span>` : ''}
          </div>
          ${shortDesc ? `<p class="text-xs text-gray-600 leading-relaxed mb-3 flex-1">${shortDesc}</p>` : '<div class="flex-1"></div>'}
          ${aliases.length > 0 ? `
          <div class="flex flex-wrap gap-1 mb-3">
            ${aliases.slice(0, 3).map(a => `<span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">${a}</span>`).join('')}
            ${aliases.length > 3 ? `<span class="text-xs text-gray-400">+${aliases.length - 3} more</span>` : ''}
          </div>` : ''}
          <div class="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span class="text-xs text-gray-400">${item.first_seen || item.last_active || ''}</span>
            <button class="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors">View Details →</button>
          </div>
        </div>
      `;
    }).join('');
  }

  async function performSearch(query) {
    if (!query || query.trim().length === 0) {
      resultsGrid.innerHTML = '';
      statsEl.classList.add('hidden');
      emptyEl.classList.remove('hidden');
      emptyEl.innerHTML = `
        <div class="text-center py-16">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <i class="fa-solid fa-satellite-dish text-2xl text-gray-400"></i>
          </div>
          <p class="text-gray-500 text-sm">Enter a search query to explore the intelligence database.</p>
          <p class="text-gray-400 text-xs mt-1">Search by name, alias, technique, or keyword.</p>
        </div>
      `;
      return;
    }

    spinner.classList.remove('hidden');

    try {
      const resp = await fetch(`/api/actors?query=${encodeURIComponent(query.trim())}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const items = Array.isArray(data) ? data : (data.results || data.actors || data.data || []);
      renderResultCards(items, query.trim());
    } catch (err) {
      // Fallback: filter local data
      const actors = (appState.data && appState.data.actors) || [];
      const services = (appState.data && appState.data.infrastructure) || [];

      const q = query.trim().toLowerCase();
      const matchedActors = actors.filter(a => {
        const fields = [a.name, a.alias, a.description, a.bio, a.type, ...(a.aliases || [])].filter(Boolean);
        return fields.some(f => f.toLowerCase().includes(q));
      }).map(a => ({ ...a, type: a.type || 'Threat Actor' }));

      const matchedServices = services.filter(s => {
        const fields = [s.title, s.onion_address, s.address, s.type, s.category].filter(Boolean);
        return fields.some(f => f.toLowerCase().includes(q));
      }).map(s => ({ ...s, name: s.title || s.onion_address || s.address, type: s.type || 'Hidden Service' }));

      renderResultCards([...matchedActors, ...matchedServices], query.trim());
    } finally {
      spinner.classList.add('hidden');
    }
  }

  // Debounced search
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => performSearch(searchInput.value), 350);
  });

  // Suggestion chips
  document.querySelectorAll('.discover-suggest').forEach(btn => {
    btn.addEventListener('click', () => {
      searchInput.value = btn.dataset.query;
      performSearch(btn.dataset.query);
    });
  });
}

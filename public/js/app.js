// DeProxy Application Core & Navigation Controller
const appState = {
    currentView: 'dashboard',
    theme: 'light',
    data: {
        stats: null,
        actors: [],
        infrastructure: []
    }
};

const routes = {
    'dashboard':       { title: 'Dashboard',       subtitle: 'Real-time threat telemetry & actor attribution', icon: 'fa-solid fa-border-all', render: renderDashboard },
    'discover':        { title: 'Discover',        subtitle: 'Search & query indexed intelligence records',   icon: 'fa-solid fa-compass',    render: renderDiscover },
    'services':        { title: 'Services',        subtitle: 'Dark web hidden service monitoring',            icon: 'fa-solid fa-server',     render: renderServices },
    'personas':        { title: 'Personas',        subtitle: 'Threat actor tracking & forensic profiles',     icon: 'fa-solid fa-user-group', render: renderPersonas },
    'infrastructure':  { title: 'Infrastructure',  subtitle: 'Origin server de-anonymization & probes',       icon: 'fa-solid fa-network-wired', render: renderInfrastructure },
    'graph':           { title: 'Graph',           subtitle: 'Entity relationship link graph',                icon: 'fa-solid fa-diagram-project', render: renderGraph },
    'investigations':  { title: 'Investigations',  subtitle: 'Active forensics & case files',                 icon: 'fa-solid fa-magnifying-glass', render: renderInvestigations },
    'alerts':          { title: 'Alerts',          subtitle: 'Real-time IOC notifications & breaches',        icon: 'fa-regular fa-bell',     render: renderAlerts, badge: 3 },
    'stylometry':      { title: 'AI Stylometry',   subtitle: 'Linguistic actor attribution & NLP markers',    icon: 'fa-solid fa-brain',      render: renderStylometry },
    'reports':         { title: 'Reports',         subtitle: 'Forensic dossier generation & export',          icon: 'fa-regular fa-file-lines', render: renderReports },
    'sources':         { title: 'Sources',         subtitle: 'Ingestion pipeline & monitored crawlers',       icon: 'fa-solid fa-database',   render: renderSources },
    'watchlist':       { title: 'Watchlist',       subtitle: 'Priority target entities & monitored nodes',    icon: 'fa-regular fa-eye',      render: renderWatchlist }
};

function initApp() {
    initTheme();
    initSearchModal();
    renderSidebar();
    navigateTo('dashboard');
    fetchInitialData();
}

// ===== THEME MANAGER (Light / Dark Mode) =====
function initTheme() {
    const saved = localStorage.getItem('deproxy_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (saved === 'dark' || (!saved && prefersDark)) {
        appState.theme = 'dark';
        document.documentElement.classList.add('dark');
    } else {
        appState.theme = 'light';
        document.documentElement.classList.remove('dark');
    }

    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        appState.theme = 'light';
        localStorage.setItem('deproxy_theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        appState.theme = 'dark';
        localStorage.setItem('deproxy_theme', 'dark');
    }

    // Refresh charts on active view if on dashboard
    if (appState.currentView === 'dashboard') {
        const actors = appState.data.actors || [];
        renderActivityChart();
        renderCategoryChart(actors);
        renderConfidenceChart(actors);
    }
}

// ===== SIDEBAR NAVIGATION =====
function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    if (!nav) return;
    nav.innerHTML = '';
    
    Object.keys(routes).forEach(key => {
        const route = routes[key];
        const a = document.createElement('a');
        a.href = `#${key}`;
        a.className = `nav-item flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all duration-150 ${appState.currentView === key ? 'active' : ''}`;
        a.onclick = (e) => {
            e.preventDefault();
            navigateTo(key);
        };
        
        let html = `
            <div class="flex items-center min-w-0">
                <i class="${route.icon} w-5 text-center mr-2.5 text-xs flex-shrink-0 ${appState.currentView === key ? 'text-primary' : 'text-text-muted'}"></i>
                <span class="truncate font-medium">${route.title}</span>
            </div>`;
        if (route.badge) {
            html += `<span class="bg-danger text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full flex-shrink-0">${route.badge}</span>`;
        }
        
        a.innerHTML = html;
        nav.appendChild(a);
    });
}

function navigateTo(view) {
    if (!routes[view]) return;
    
    appState.currentView = view;
    
    // Update header
    const titleEl = document.getElementById('current-page-title');
    const subtitleEl = document.getElementById('current-page-subtitle');
    if (titleEl) titleEl.innerText = routes[view].title;
    if (subtitleEl) subtitleEl.innerText = routes[view].subtitle || '';
    
    // Update sidebar active state
    renderSidebar();
    
    // Render content with smooth transition
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="flex justify-center items-center h-48">
            <div class="flex flex-col items-center gap-2">
                <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                <span class="text-xs text-text-muted">Loading ${routes[view].title}...</span>
            </div>
        </div>`;
    
    setTimeout(() => {
        mainContent.innerHTML = '<div id="view-container" class="fade-in"></div>';
        try {
            routes[view].render(document.getElementById('view-container'));
        } catch (err) {
            console.error(`Error rendering ${view}:`, err);
            document.getElementById('view-container').innerHTML = `
                <div class="flex flex-col items-center justify-center h-48 border border-dashed border-red-200 dark:border-red-900/40 rounded-xl bg-red-50/50 dark:bg-red-950/20 mt-8">
                    <i class="fa-solid fa-triangle-exclamation text-2xl text-red-400 mb-2"></i>
                    <h3 class="text-sm font-semibold text-red-600 dark:text-red-400">View Rendering Error</h3>
                    <p class="text-xs text-red-500 mt-1">${err.message}</p>
                </div>`;
        }
    }, 80);
}

// ===== GLOBAL SEARCH / COMMAND PALETTE (Ctrl+K) =====
function initSearchModal() {
    const modal = document.getElementById('search-modal');
    const triggerBtn = document.getElementById('search-trigger-btn');
    const closeBtn = document.getElementById('modal-close-btn');
    const input = document.getElementById('modal-search-input');
    const resultsContainer = document.getElementById('modal-search-results');

    if (!modal || !input) return;

    function openModal() {
        modal.classList.remove('hidden');
        input.value = '';
        renderSearchResults('');
        setTimeout(() => input.focus(), 50);
    }

    function closeModal() {
        modal.classList.add('hidden');
    }

    if (triggerBtn) triggerBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (modal.classList.contains('hidden')) openModal();
            else closeModal();
        }
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    input.addEventListener('input', (e) => {
        renderSearchResults(e.target.value.trim().toLowerCase());
    });

    function renderSearchResults(query) {
        const actors = appState.data.actors || [];
        const infra = appState.data.infrastructure || [];
        
        let matches = [];

        if (!query) {
            // Default suggestions
            actors.slice(0, 3).forEach(a => matches.push({ type: 'PERSONA', title: a.primary_handle, sub: a.category, view: 'personas', id: a.id }));
            infra.slice(0, 2).forEach(s => matches.push({ type: 'ONION', title: s.service_name, sub: s.onion_address, view: 'services' }));
        } else {
            actors.forEach(a => {
                if (a.primary_handle.toLowerCase().includes(query) || a.category.toLowerCase().includes(query) || (a.suspect_real_entity?.clearnet_ip && a.suspect_real_entity.clearnet_ip.includes(query))) {
                    matches.push({ type: 'PERSONA', title: a.primary_handle, sub: `${a.category} • ${a.threat_level}`, view: 'personas', id: a.id });
                }
            });

            infra.forEach(s => {
                if (s.service_name.toLowerCase().includes(query) || s.onion_address.toLowerCase().includes(query) || (s.origin_attribution?.clearnet_ip && s.origin_attribution.clearnet_ip.includes(query))) {
                    matches.push({ type: 'ONION', title: s.service_name, sub: s.onion_address, view: 'infrastructure' });
                }
            });
        }

        if (!matches.length) {
            resultsContainer.innerHTML = '<div class="py-6 text-center text-text-muted text-xs">No matching intelligence records found</div>';
            return;
        }

        resultsContainer.innerHTML = matches.map(m => `
            <div class="search-result-item flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-secondary cursor-pointer transition-colors" data-view="${m.view}">
                <div class="flex items-center gap-2.5 min-w-0">
                    <span class="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${m.type === 'PERSONA' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'} flex-shrink-0">${m.type === 'PERSONA' ? 'ACT' : 'SRV'}</span>
                    <div class="min-w-0">
                        <div class="font-medium text-text-main text-xs truncate">${m.title}</div>
                        <div class="text-[10px] text-text-muted font-mono truncate">${m.sub}</div>
                    </div>
                </div>
                <i class="fa-solid fa-chevron-right text-[10px] text-text-muted flex-shrink-0"></i>
            </div>
        `).join('');

        resultsContainer.querySelectorAll('.search-result-item').forEach(el => {
            el.addEventListener('click', () => {
                const targetView = el.dataset.view;
                closeModal();
                navigateTo(targetView);
            });
        });
    }
}

// ===== DATA INGESTION =====
async function fetchInitialData() {
    try {
        const [statsRes, actorsRes, infraRes] = await Promise.all([
            fetch('/api/stats'),
            fetch('/api/actors'),
            fetch('/api/infrastructure')
        ]);
        
        if (statsRes.ok) appState.data.stats = await statsRes.json();
        if (actorsRes.ok) appState.data.actors = await actorsRes.json();
        if (infraRes.ok) appState.data.infrastructure = await infraRes.json();
        
        console.log(`[DeProxy] Loaded ${appState.data.actors.length} actors, ${appState.data.infrastructure.length} services`);
        
        if (appState.currentView === 'dashboard') {
            navigateTo('dashboard');
        }
    } catch (err) {
        console.error("[DeProxy] Failed to load data:", err);
    }
}

document.addEventListener('DOMContentLoaded', initApp);
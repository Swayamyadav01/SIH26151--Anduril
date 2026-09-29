// Anduril Application Core & Navigation Controller
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
    'alerts':          { title: 'Alerts',          subtitle: 'Real-time IOC notifications & breaches',        icon: 'fa-regular fa-bell',     render: renderAlerts },
    'stylometry':      { title: 'AI Stylometry',   subtitle: 'Linguistic actor attribution & NLP markers',    icon: 'fa-solid fa-brain',      render: renderStylometry },
    'reports':         { title: 'Reports',         subtitle: 'Forensic dossier generation & export',          icon: 'fa-regular fa-file-lines', render: renderReports },
    'sources':         { title: 'Sources',         subtitle: 'Ingestion pipeline & monitored crawlers',       icon: 'fa-solid fa-database',   render: renderSources },
    'watchlist':       { title: 'Watchlist',       subtitle: 'Priority target entities & monitored nodes',    icon: 'fa-regular fa-eye',      render: renderWatchlist }
};

function initApp() {
    initTheme();
    initSearchModal();
    renderSidebar();
    initMobileNavigation();
    fetchInitialData();
}

// ===== THEME MANAGER (Light / Dark Mode) =====
function initTheme() {
    appState.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const dark = document.documentElement.classList.toggle('dark');
    appState.theme = dark ? 'dark' : 'light';
    try { localStorage.setItem('anduril_theme', appState.theme); } catch (_) {}
    document.getElementById('theme-toggle').setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
    if (appState.currentView === 'dashboard') {
        renderActivityChart();
        renderCategoryChart(appState.data.actors);
        renderConfidenceChart(appState.data.actors);
    }
    if (appState.currentView === 'graph') updateGraphTheme();
}

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function initMobileNavigation() {
    const toggle = document.getElementById('mobile-menu-btn');
    const backdrop = document.getElementById('sidebar-backdrop');
    const close = () => {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        backdrop.hidden = true;
    };
    toggle.onclick = () => {
        const open = document.body.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', String(open));
        backdrop.hidden = !open;
    };
    backdrop.onclick = close;
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    window.closeMobileNavigation = close;
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
        if (appState.currentView === key) a.setAttribute('aria-current', 'page');
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

let navigationVersion = 0;
function navigateTo(view, selection = null) {
    if (!routes[view]) return;
    navigationVersion++;
    destroyDashboard();
    destroyGraph();
    if (typeof Chart !== 'undefined') Object.values(Chart.instances).forEach(chart => chart.destroy());
    appState.currentView = view;
    appState.selection = selection;
    closeMobileNavigation?.();
    document.getElementById('current-page-title').textContent = routes[view].title;
    renderSidebar();
    const main = document.getElementById('main-content');
    main.scrollTop = 0;
    main.innerHTML = '<div id="view-container" class="fade-in"></div>';
    try {
        routes[view].render(document.getElementById('view-container'));
    } catch (err) {
        console.error(err);
        main.innerHTML = `<div class="stat-card" role="alert">Unable to open this view: ${escapeHTML(err.message)}</div>`;
    }
}

// ===== GLOBAL SEARCH / COMMAND PALETTE (Ctrl+K) =====
function initSearchModal() {
    const modal = document.getElementById('search-modal');
    const input = document.getElementById('modal-search-input');
    const results = document.getElementById('modal-search-results');
    let matches = [], selected = 0, previousFocus;
    function close() {
        modal.classList.add('hidden');
        input.setAttribute('aria-expanded', 'false');
        previousFocus?.focus();
    }
    function open() {
        const dossier = document.getElementById('persona-modal');
        if (dossier?.open) dossier.close();
        previousFocus = document.activeElement;
        modal.classList.remove('hidden');
        input.setAttribute('aria-expanded', 'true');
        input.value = '';
        search();
        input.focus();
    }
    function activate() {
        if (!matches[selected]) return;
        const m = matches[selected];
        close();
        navigateTo(m.view, m.selection);
    }
    function highlight() {
        results.querySelectorAll('[role="option"]').forEach((el, i) => {
            el.setAttribute('aria-selected', String(i === selected));
            if (i === selected) {
                input.setAttribute('aria-activedescendant', el.id);
                el.scrollIntoView({ block: 'nearest' });
            }
        });
    }
    function search() {
        const query = input.value.trim().toLowerCase();
        const records = appState.data.actors.map(a => ({type:'ACTOR', title:a.primary_handle, sub:a.category,
            terms:[a.id, ...(a.handles || []).map(h => h.handle)].join(' '), view:'personas', selection:{actor:a.id}}));
        appState.data.infrastructure.forEach(s => {
            records.push({type:'ONION', title:s.service_name, sub:s.onion_address, view:'services', selection:{service:s.onion_address}});
            if (s.origin_attribution?.clearnet_ip) records.push({type:'ORIGIN IP', title:s.origin_attribution.clearnet_ip,
                sub:s.service_name, view:'services', selection:{service:s.onion_address}});
        });
        appState.data.actors.forEach(a => {
            const ip = a.suspect_real_entity?.clearnet_ip;
            if (ip && !records.some(r => r.type === 'ORIGIN IP' && r.title === ip)) {
                records.push({type:'ORIGIN IP', title:ip, sub:a.primary_handle, view:'personas', selection:{actor:a.id}});
            }
        });
        matches = records.filter(m => !query || `${m.title} ${m.sub} ${m.terms || ''}`.toLowerCase().includes(query)).slice(0, 30);
        selected = 0;
        input.removeAttribute('aria-activedescendant');
        results.innerHTML = matches.length ? matches.map((m,i) => `<div id="search-option-${i}" role="option" aria-selected="false" class="search-result-item" data-index="${i}">
            <span class="search-kind">${m.type}</span><div class="min-w-0"><div class="font-semibold truncate">${escapeHTML(m.title)}</div><div class="text-text-muted font-mono text-[10px] truncate">${escapeHTML(m.sub)}</div></div><span class="text-text-muted">↵</span></div>`).join('') : '<p class="p-6 text-center text-text-muted" role="status">No matching intelligence records found.</p>';
        highlight();
    }
    results.onclick = e => {
        const option = e.target.closest('[data-index]');
        if (option) { selected = Number(option.dataset.index); activate(); }
    };
    input.oninput = search;
    document.getElementById('search-trigger-btn').onclick = open;
    document.getElementById('modal-close-btn').onclick = close;
    modal.onclick = e => { if (e.target === modal) close(); };
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            modal.classList.contains('hidden') ? open() : close();
            return;
        }
        if (modal.classList.contains('hidden')) return;
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        if (e.key === 'Enter' && e.target === input) { e.preventDefault(); activate(); }
        if (['ArrowDown','ArrowUp'].includes(e.key) && matches.length) {
            e.preventDefault();
            selected = (selected + (e.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length;
            highlight();
        }
        if (e.key === 'Tab') {
            e.preventDefault();
            const closeButton = document.getElementById('modal-close-btn');
            (document.activeElement === input ? closeButton : input).focus();
        }
    });
}

// ===== DATA INGESTION =====
async function fetchInitialData() {
    try {
        const [statsRes, actorsRes, infraRes] = await Promise.all([
            fetch('/api/stats'),
            fetch('/api/actors'),
            fetch('/api/infrastructure')
        ]);
        
        if (![statsRes, actorsRes, infraRes].every(r => r.ok)) throw new Error('Intelligence API unavailable');
        if (statsRes.ok) appState.data.stats = await statsRes.json();
        if (actorsRes.ok) appState.data.actors = await actorsRes.json();
        if (infraRes.ok) appState.data.infrastructure = await infraRes.json();
        
        console.log(`[Anduril] Loaded ${appState.data.actors.length} actors, ${appState.data.infrastructure.length} services`);
        
        if (appState.currentView === 'dashboard') {
            navigateTo('dashboard');
        }
    } catch (err) {
        document.getElementById('main-content').innerHTML = '<div class="stat-card" role="alert"><h2 class="font-semibold mb-2">Intelligence data unavailable</h2><p class="text-sm text-text-muted mb-4">Check the local server connection and try again.</p><button class="btn-primary" onclick="fetchInitialData()">Retry connection</button></div>';
    }
}

document.addEventListener('DOMContentLoaded', initApp);
function downloadArtifact(filename, content, type = 'application/json') {
    const url = URL.createObjectURL(new Blob([content], {type}));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function loadLocalState(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch (_) { return fallback; }
}
function saveLocalState(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
}

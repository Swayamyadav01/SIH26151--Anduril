// App Navigation & State
const appState = {
    currentView: 'dashboard',
    data: {
        stats: null,
        actors: [],
        infrastructure: []
    }
};

const routes = {
    'dashboard':       { title: 'Dashboard',       subtitle: 'Welcome back, Security Analyst',       icon: 'fa-solid fa-border-all',              render: renderDashboard },
    'discover':        { title: 'Discover',         subtitle: 'Search across all intelligence data',  icon: 'fa-solid fa-compass',                 render: renderDiscover },
    'services':        { title: 'Services',         subtitle: 'Dark web service monitoring',          icon: 'fa-solid fa-server',                  render: renderServices },
    'personas':        { title: 'Personas',         subtitle: 'Threat actor tracking & analysis',     icon: 'fa-solid fa-user-group',              render: renderPersonas },
    'infrastructure':  { title: 'Infrastructure',   subtitle: 'Origin server de-anonymization',       icon: 'fa-solid fa-network-wired',           render: renderInfrastructure },
    'graph':           { title: 'Graph',            subtitle: 'Entity relationship visualization',    icon: 'fa-solid fa-diagram-project',         render: renderGraph },
    'investigations':  { title: 'Investigations',   subtitle: 'Active case management',               icon: 'fa-solid fa-magnifying-glass',        render: renderInvestigations },
    'alerts':          { title: 'Alerts',           subtitle: 'Real-time threat notifications',       icon: 'fa-regular fa-bell',                  render: renderAlerts, badge: 3 },
    'stylometry':      { title: 'AI Stylometry',    subtitle: 'Linguistic actor matching',            icon: 'fa-solid fa-brain',                   render: renderStylometry },
    'reports':         { title: 'Reports',          subtitle: 'Intelligence reporting & exports',     icon: 'fa-regular fa-file-lines',            render: renderReports },
    'sources':         { title: 'Sources',          subtitle: 'Data collection pipeline',             icon: 'fa-solid fa-database',                render: renderSources },
    'watchlist':       { title: 'Watchlist',        subtitle: 'Monitored entities & subjects',        icon: 'fa-regular fa-eye',                   render: renderWatchlist }
};

function initApp() {
    renderSidebar();
    navigateTo('dashboard');
    fetchInitialData();
}

function renderSidebar() {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = '';
    
    Object.keys(routes).forEach(key => {
        const route = routes[key];
        const a = document.createElement('a');
        a.href = `#${key}`;
        a.className = `nav-item flex items-center justify-between px-3 py-2.5 rounded-lg mb-0.5 text-sm cursor-pointer transition-all duration-200 ${appState.currentView === key ? 'active' : 'text-gray-600 hover:text-gray-800'}`;
        a.onclick = (e) => {
            e.preventDefault();
            navigateTo(key);
        };
        
        let html = `<div class="flex items-center"><i class="${route.icon} w-5 text-center mr-3 text-[15px] ${appState.currentView === key ? 'text-primary' : 'text-gray-400'}"></i><span>${route.title}</span></div>`;
        if (route.badge) {
            html += `<span class="bg-danger text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">${route.badge}</span>`;
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
    
    // Clear and render new content with loading spinner
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="flex justify-center items-center h-64">
            <div class="flex flex-col items-center">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
                <span class="text-sm text-text-muted">Loading ${routes[view].title}...</span>
            </div>
        </div>`;
    
    setTimeout(() => {
        mainContent.innerHTML = '<div id="view-container" class="fade-in"></div>';
        try {
            routes[view].render(document.getElementById('view-container'));
        } catch (err) {
            console.error(`Error rendering ${view}:`, err);
            document.getElementById('view-container').innerHTML = `
                <div class="flex flex-col items-center justify-center h-64 border-2 border-dashed border-red-200 rounded-xl bg-red-50/50 mt-10">
                    <i class="fa-solid fa-triangle-exclamation text-4xl text-red-300 mb-4"></i>
                    <h3 class="text-lg font-medium text-red-700">Error Loading Module</h3>
                    <p class="text-sm text-red-500 mt-2">${err.message}</p>
                </div>`;
        }
    }, 150);
}

// Fetch global data from backend APIs
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
        
        console.log(`[DeProxy] Loaded: ${appState.data.actors.length} actors, ${appState.data.infrastructure.length} services`);
        
        // Re-render current view with real data
        if (appState.currentView === 'dashboard') {
            navigateTo('dashboard');
        }
    } catch (err) {
        console.error("[DeProxy] Failed to fetch initial data:", err);
    }
}

document.addEventListener('DOMContentLoaded', initApp);

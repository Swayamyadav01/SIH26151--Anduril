function renderGraph(container) {
    container.innerHTML = `
        <!-- Top Controls Bar -->
        <div class="flex flex-wrap gap-3 justify-between items-center mb-4">
            <div>
                <h2 class="text-xl font-bold text-text-main flex items-center">
                    <i class="fa-solid fa-diagram-project mr-2.5 text-primary text-base"></i> Relationships
                </h2>

            </div>

            <!-- Controls & Filters -->
            <div class="flex flex-wrap gap-2 items-center">
                <!-- Search within Graph -->
                <div class="relative">
                    <i class="fa-solid fa-search text-[11px] text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2"></i>
                    <input type="text" id="graph-search" aria-label="Find graph entity" class="pl-7 pr-3 py-1.5 border border-border-color rounded-lg text-xs bg-surface text-text-main placeholder-text-muted w-44 focus:outline-none focus:border-primary" placeholder="Find entity / IP...">
                </div>

                <!-- Entity Filter -->
                <select id="graph-filter-type" aria-label="Filter entity type" class="border border-border-color rounded-lg px-2.5 py-1.5 text-xs bg-surface text-text-main focus:outline-none focus:border-primary">
                    <option value="ALL">All Entities</option>
                    <option value="ACTOR">Threat Actors</option>
                    <option value="CLEARNET_IP">Origin IPs</option>
                    <option value="WALLET">Crypto Wallets</option>
                    <option value="HANDLE">Alias Handles</option>
                    <option value="PGP">PGP Keys</option>
                </select>

                <!-- Lock / Unlock Layout -->
                <button class="btn-secondary text-xs" id="btn-toggle-physics" title="Toggle physics simulation">
                    <i class="fa-solid fa-lock mr-1.5 text-xs"></i> Fixed Layout
                </button>

                <!-- Reset Zoom -->
                <button class="btn-secondary text-xs" id="btn-reset-zoom" title="Fit all nodes in view">
                    <i class="fa-solid fa-compress mr-1.5 text-xs"></i> Fit
                </button>
            </div>
        </div>

        <div class="graph-workspace">
            <!-- Main Graph Canvas -->
            <div class="graph-stage bg-surface rounded-xl shadow-xs border border-border-color flex flex-col relative overflow-hidden">
                <!-- Top Toolbar overlay -->
                <div class="absolute top-3 left-3 z-10 bg-surface/90 backdrop-blur-xs rounded-lg shadow-xs border border-border-color p-1 flex space-x-1">
                    <button class="w-7 h-7 rounded hover:bg-surface-secondary flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer" title="Zoom In" id="btn-zoom-in"><i class="fa-solid fa-plus text-xs"></i></button>
                    <button class="w-7 h-7 rounded hover:bg-surface-secondary flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer" title="Zoom Out" id="btn-zoom-out"><i class="fa-solid fa-minus text-xs"></i></button>
                </div>

                <!-- Enterprise Legend overlay -->
                <div class="absolute bottom-3 left-3 z-10 bg-surface/90 backdrop-blur-xs rounded-lg shadow-xs border border-border-color p-2.5 text-[11px]">
                    <div class="font-semibold text-text-main mb-1.5 text-[11px] uppercase tracking-wider">Entities</div>
                    <div class="grid grid-cols-2 gap-x-3 gap-y-1.5 text-text-muted">
                        <div class="flex items-center"><div class="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5"></div> Threat Actor</div>
                        <div class="flex items-center"><div class="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></div> Clearnet Origin IP</div>
                        <div class="flex items-center"><div class="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1.5"></div> Alias Handle</div>
                        <div class="flex items-center"><div class="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></div> Crypto Wallet</div>
                        <div class="flex items-center"><div class="w-2.5 h-2.5 rounded-full bg-purple-500 mr-1.5"></div> PGP Signature</div>
                    </div>
                </div>

                <span id="graph-search-status" role="status" class="graph-status text-xs text-text-muted"></span>
                <div id="network-container" class="flex-1 w-full h-full"></div>
            </div>

            <!-- Structured Enterprise Inspector -->
            <div class="bg-surface rounded-xl shadow-xs border border-border-color flex flex-col overflow-hidden">
                <div class="p-3 border-b border-border-color bg-surface-secondary/50 flex items-center justify-between">
                    <h3 class="font-semibold text-text-main text-xs flex items-center">
                        <i class="fa-solid fa-microchip text-primary mr-2"></i> Inspector
                    </h3>
                </div>
                <div class="flex-1 overflow-y-auto p-4" id="graph-inspector-content">
                    <div class="flex flex-col items-center justify-center h-full text-center text-text-muted text-xs p-3">
                        <i class="fa-solid fa-crosshairs text-2xl mb-2 text-text-muted/30"></i>
                        <p class="font-medium text-text-main mb-1">Select an entity</p>

                    </div>
                </div>
            </div>
        </div>
    `;

    graphTimer = setTimeout(async () => {
        if (!container.isConnected) return;
        const version = navigationVersion;
        try {
            const res = await fetch('/api/graph');
            if (!res.ok) throw new Error("Failed to fetch graph data");
            const data = await res.json();

            if (!container.isConnected || version !== navigationVersion) return;
            initEnterpriseGraph(data.nodes, data.edges);
        } catch (err) {
            console.error(err);
            const target = container.querySelector('#network-container');
            if (target) {
                target.innerHTML = `
                    <div class="flex items-center justify-center h-full text-danger text-xs">
                        Graph unavailable. Reload the view to retry.
                    </div>
                `;
            }
        }
    }, 100);
}

let networkInstance = null;
let graphTimer = null;
function destroyGraph() {
    clearTimeout(graphTimer);
    networkInstance?.destroy();
    networkInstance = null;
}
function updateGraphTheme() {
    if (!networkInstance) return;
    const color = isDark() ? '#e2e8f0' : '#1e293b';
    graphDataset.nodes.update(graphDataset.nodes.get().map(n => ({id:n.id,font:{color}})));
    networkInstance.setOptions({edges:{font:{color:isDark() ? '#94a3b8' : '#64748b',strokeWidth:0}}});
}

let graphDataset = { nodes: null, edges: null, rawNodes: [], rawEdges: [] };
let isPhysicsLocked = true;

function initEnterpriseGraph(nodesData, edgesData) {
    const container = document.getElementById('network-container');
    if (!container) return;

    const dark = document.documentElement.classList.contains('dark');
    nodesData = nodesData.map(n => ({...n, shape:'dot', borderWidth:1.5,
        font:{face:'system-ui', size:12, color:dark ? '#e2e8f0':'#1e293b', strokeWidth:0}}));
    graphDataset.rawNodes = nodesData;
    graphDataset.rawEdges = edgesData;

    graphDataset.nodes = new vis.DataSet(nodesData);
    graphDataset.edges = new vis.DataSet(edgesData);

    const options = {
        layout: { randomSeed: 42, improvedLayout: true },
        nodes: {
            font: {
                face: 'system-ui',
                size: 11,
                color: dark ? '#e2e8f0' : '#1e293b'
            },
            borderWidth: 1.5,
            shadow: false
        },
        edges: {
            font: {
                face: 'monospace',
                size: 9,
                align: 'middle',
                color: dark ? '#94a3b8' : '#64748b',
                strokeWidth: 0
            },
            smooth: {
                enabled: false,
                type: 'continuous',
                roundness: 0.15
            },
            arrows: {
                to: { enabled: true, scaleFactor: 0.4 }
            },
            color: {
                color: dark ? '#334155' : '#cbd5e1',
                highlight: '#14b8a6'
            },
            width: 1
        },
        physics: {
            enabled: true,
            stabilization: {
                iterations: 120,
                updateInterval: 25
            },
            barnesHut: {
                gravitationalConstant: -3500,
                centralGravity: 0.35,
                springLength: 100,
                springConstant: 0.04,
                damping: 0.3
            }
        },
        interaction: {
            hover: true,
            zoomView: true,
            dragNodes: true,
            navigationButtons: false
        }
    };

    networkInstance = new vis.Network(container, { nodes: graphDataset.nodes, edges: graphDataset.edges }, options);

    // AUTO-FREEZE physics once settled so it DOES NOT bounce or jiggle like a game!
    networkInstance.once('stabilized', function () {
        networkInstance.setOptions({ physics: { enabled: false } });
        isPhysicsLocked = true;
        const lockBtn = document.getElementById('btn-toggle-physics');
        if (lockBtn) lockBtn.setAttribute('aria-pressed', 'true');
        if (lockBtn) lockBtn.innerHTML = '<i class="fa-solid fa-lock mr-1.5 text-xs"></i> Layout Fixed';
    });

    // Zoom controls
    const zoomInBtn = document.getElementById('btn-zoom-in');
    const zoomOutBtn = document.getElementById('btn-zoom-out');
    const resetZoomBtn = document.getElementById('btn-reset-zoom');
    const togglePhysicsBtn = document.getElementById('btn-toggle-physics');
    const searchInput = document.getElementById('graph-search');
    const filterSelect = document.getElementById('graph-filter-type');

    if (zoomInBtn) zoomInBtn.onclick = () => {
        const scale = networkInstance.getScale();
        networkInstance.moveTo({ scale: scale * 1.3 });
    };
    if (zoomOutBtn) zoomOutBtn.onclick = () => {
        const scale = networkInstance.getScale();
        networkInstance.moveTo({ scale: scale * 0.75 });
    };
    if (resetZoomBtn) resetZoomBtn.onclick = () => {
        networkInstance.fit({ animation: { duration: 400, easingFunction: 'easeInOutQuad' } });
    };

    // Toggle physics freeze
    if (togglePhysicsBtn) {
        togglePhysicsBtn.onclick = () => {
            isPhysicsLocked = !isPhysicsLocked;
            networkInstance.setOptions({ physics: { enabled: !isPhysicsLocked } });
            togglePhysicsBtn.setAttribute('aria-pressed', String(isPhysicsLocked));
            togglePhysicsBtn.innerHTML = isPhysicsLocked 
                ? '<i class="fa-solid fa-lock mr-1.5 text-xs"></i> Layout Fixed' 
                : '<i class="fa-solid fa-unlock mr-1.5 text-xs text-primary"></i> Physics Active';
        };
    }

    // Search and auto-focus
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            const status = document.getElementById('graph-search-status');
            if (!query) { status.textContent = ''; return; }

            const allNodes = graphDataset.nodes.get();
            const match = allNodes.find(n => (n.label && n.label.toLowerCase().includes(query)) || (n.id && String(n.id).toLowerCase().includes(query)));
            status.textContent = match ? `Selected: ${match.label}` : 'No matching entity in this filter';
            if (match) {
                networkInstance.selectNodes([match.id]);
                networkInstance.focus(match.id, {
                    scale: 1.4,
                    animation: { duration: reducedMotion() ? 0 : 500, easingFunction: 'easeInOutQuad' }
                });
                renderForensicInspector(match, match.id);
            }
        });
    }

    // Filter by type
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const selected = e.target.value;
            const positions = networkInstance.getPositions();
            graphDataset.rawNodes = graphDataset.rawNodes.map(n => ({...n,...positions[n.id]}));
            const filtered = graphDataset.rawNodes.filter(n => selected === 'ALL' || n.group === selected);
            const ids = new Set(filtered.map(n => n.id));
            graphDataset.edges.clear();
            graphDataset.nodes.clear();
            graphDataset.nodes.add(filtered);
            graphDataset.edges.add(graphDataset.rawEdges.filter(e => ids.has(e.from) && ids.has(e.to)));
            document.getElementById('graph-inspector-content').innerHTML = '<p class="text-xs text-text-muted">Select an entity to inspect its records.</p>';
            document.getElementById('graph-search-status').textContent = `${filtered.length} entities shown`;
            updateGraphTheme();
            networkInstance.fit({ animation: reducedMotion() ? false : {duration:300} });
        });
    }

    // Node selection
    networkInstance.on("selectNode", function (params) {
        const nodeId = params.nodes[0];
        const node = graphDataset.nodes.get(nodeId);
        renderForensicInspector(node, nodeId);
    });

    networkInstance.on("deselectNode", function () {
        const inspector = document.getElementById('graph-inspector-content');
        if (inspector) {
            inspector.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center text-text-muted text-xs p-3">
                    <i class="fa-solid fa-crosshairs text-2xl mb-2 text-text-muted/30"></i>
                    <p class="font-medium text-text-main mb-1">Select an entity</p>

                </div>
            `;
        }
    });
}

function renderForensicInspector(node, nodeId) {
    const inspector = document.getElementById('graph-inspector-content');
    if (!inspector || !node) return;
    const actorIds = node.group === 'ACTOR' ? [nodeId.replace('actor_','')] : graphDataset.rawEdges
        .filter(e => e.to === nodeId && e.from.startsWith('actor_')).map(e => e.from.replace('actor_',''));
    const actors = appState.data.actors.filter(a => actorIds.includes(a.id));
    const actor = actors[0];
    const services = appState.data.infrastructure.filter(s => actorIds.includes(s.associated_actor_id));
    const origin = services[0]?.origin_attribution || actor?.suspect_real_entity || {};
    const fields = [
        ['Threat level', actor?.threat_level || 'Not recorded'],
        ['Confidence', actor?.attribution_confidence != null ? actor.attribution_confidence + '%' : 'Not recorded'],
        ['Linked actors', actors.map(a => a.primary_handle).join(', ') || 'None recorded'],
        ['Origin IP', origin.clearnet_ip || 'Not recorded'],
        ['ISP', origin.isp || 'Not recorded'],
        ['Location', origin.country || origin.location || 'Not recorded']
    ];
    let identifier = node.label.replace('ORIGIN IP: ', '');
    if (node.group === 'WALLET') identifier = actor?.crypto_wallets.find(w => nodeId === 'wallet_' + w.currency + '_' + w.address.slice(0,10))?.address || identifier;
    if (node.group === 'PGP') identifier = actor?.pgp_fingerprints[Number(nodeId.split('_').at(-1))] || identifier;
    inspector.innerHTML = `<div class="space-y-4 fade-in">
        <span class="badge badge-info">${escapeHTML(node.group.replaceAll('_',' '))}</span>
        <div><p class="eyebrow">PRIMARY IDENTIFIER</p><h4 class="font-semibold text-sm break-all mt-1">${escapeHTML(identifier)}</h4></div>
        <dl class="dossier-fields">${fields.map(([label,value]) => `<div><dt>${label}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl>
        <div><p class="eyebrow mb-2">LINKED INFRASTRUCTURE</p>${services.length ? services.map(service => `<p class="text-xs break-all mb-2">${escapeHTML(service.onion_address)}</p>`).join('') : '<p class="text-xs text-text-muted">None recorded</p>'}</div>
        <div id="inspector-actions" class="flex flex-col gap-2"></div>
    </div>`;
    const actions = document.getElementById('inspector-actions');
    if (actor) {
        const button = document.createElement('button');
        button.className = 'btn-primary justify-center';
        button.textContent = 'Open actor dossier';
        button.onclick = () => navigateTo('personas', {actor:actor.id});
        actions.appendChild(button);
    }
    if (services.length) {
        const button = document.createElement('button');
        button.className = 'btn-secondary justify-center';
        button.textContent = 'Inspect infrastructure';
        button.onclick = () => navigateTo('services', {service:services[0].onion_address});
        actions.appendChild(button);
    }
}

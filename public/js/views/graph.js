function renderGraph(container) {
    container.innerHTML = `
        <!-- Top Controls Bar -->
        <div class="flex flex-wrap gap-3 justify-between items-center mb-4">
            <div>
                <h2 class="text-xl font-bold text-text-main flex items-center">
                    <i class="fa-solid fa-diagram-project mr-2.5 text-primary text-base"></i> Threat Entity Relationship Topology
                </h2>
                <p class="text-xs text-text-muted mt-0.5">Enterprise forensic graph connecting threat actors, unmasked IPs, aliases, and crypto wallets.</p>
            </div>
            
            <!-- Controls & Filters -->
            <div class="flex flex-wrap gap-2 items-center">
                <!-- Search within Graph -->
                <div class="relative">
                    <i class="fa-solid fa-search text-[11px] text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2"></i>
                    <input type="text" id="graph-search" class="pl-7 pr-3 py-1.5 border border-border-color rounded-lg text-xs bg-surface text-text-main placeholder-text-muted w-44 focus:outline-none focus:border-primary" placeholder="Find entity / IP...">
                </div>

                <!-- Entity Filter -->
                <select id="graph-filter-type" class="border border-border-color rounded-lg px-2.5 py-1.5 text-xs bg-surface text-text-main focus:outline-none focus:border-primary">
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

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-190px)] min-h-[500px]">
            <!-- Main Graph Canvas -->
            <div class="lg:col-span-3 bg-surface rounded-xl shadow-xs border border-border-color flex flex-col relative overflow-hidden">
                <!-- Top Toolbar overlay -->
                <div class="absolute top-3 left-3 z-10 bg-surface/90 backdrop-blur-xs rounded-lg shadow-xs border border-border-color p-1 flex space-x-1">
                    <button class="w-7 h-7 rounded hover:bg-surface-secondary flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer" title="Zoom In" id="btn-zoom-in"><i class="fa-solid fa-plus text-xs"></i></button>
                    <button class="w-7 h-7 rounded hover:bg-surface-secondary flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer" title="Zoom Out" id="btn-zoom-out"><i class="fa-solid fa-minus text-xs"></i></button>
                </div>
                
                <!-- Enterprise Legend overlay -->
                <div class="absolute bottom-3 left-3 z-10 bg-surface/90 backdrop-blur-xs rounded-lg shadow-xs border border-border-color p-2.5 text-[11px]">
                    <div class="font-semibold text-text-main mb-1.5 text-[11px] uppercase tracking-wider">Topology Schema</div>
                    <div class="grid grid-cols-2 gap-x-3 gap-y-1.5 text-text-muted">
                        <div class="flex items-center"><div class="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5"></div> Threat Actor</div>
                        <div class="flex items-center"><div class="w-2.5 h-2.5 rounded-xs bg-amber-500 mr-1.5"></div> Clearnet Origin IP</div>
                        <div class="flex items-center"><div class="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1.5"></div> Alias Handle</div>
                        <div class="flex items-center"><div class="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></div> Crypto Wallet</div>
                        <div class="flex items-center"><div class="w-2.5 h-2.5 rounded-full bg-purple-500 mr-1.5"></div> PGP Signature</div>
                    </div>
                </div>

                <div id="network-container" class="flex-1 w-full h-full"></div>
            </div>

            <!-- Structured Enterprise Forensic Inspector -->
            <div class="bg-surface rounded-xl shadow-xs border border-border-color flex flex-col overflow-hidden">
                <div class="p-3 border-b border-border-color bg-surface-secondary/50 flex items-center justify-between">
                    <h3 class="font-semibold text-text-main text-xs flex items-center">
                        <i class="fa-solid fa-microchip text-primary mr-2"></i> Forensic Inspector
                    </h3>
                </div>
                <div class="flex-1 overflow-y-auto p-4" id="graph-inspector-content">
                    <div class="flex flex-col items-center justify-center h-full text-center text-text-muted text-xs p-3">
                        <i class="fa-solid fa-crosshairs text-2xl mb-2 text-text-muted/30"></i>
                        <p class="font-medium text-text-main mb-1">Target Entity Dossier</p>
                        <p class="text-[11px] leading-relaxed">Select any node in the topology network to inspect metadata, unmasked clearnet records, and linked indicators.</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    setTimeout(async () => {
        try {
            const res = await fetch('/api/graph');
            if (!res.ok) throw new Error("Failed to fetch graph data");
            const data = await res.json();
            
            initEnterpriseGraph(data.nodes, data.edges);
        } catch (err) {
            console.error(err);
            const container = document.getElementById('network-container');
            if (container) {
                container.innerHTML = `
                    <div class="flex items-center justify-center h-full text-danger text-xs">
                        Failed to load graph data from API.
                    </div>
                `;
            }
        }
    }, 100);
}

let networkInstance = null;
let graphDataset = { nodes: null, edges: null, rawNodes: [], rawEdges: [] };
let isPhysicsLocked = true;

function initEnterpriseGraph(nodesData, edgesData) {
    const container = document.getElementById('network-container');
    if (!container) return;

    const dark = document.documentElement.classList.contains('dark');
    graphDataset.rawNodes = nodesData;
    graphDataset.rawEdges = edgesData;

    graphDataset.nodes = new vis.DataSet(nodesData);
    graphDataset.edges = new vis.DataSet(edgesData);

    const options = {
        nodes: {
            font: {
                face: 'Inter',
                size: 11,
                color: dark ? '#e2e8f0' : '#1e293b'
            },
            borderWidth: 1.5,
            shadow: false
        },
        edges: {
            font: {
                face: 'JetBrains Mono',
                size: 9,
                align: 'middle',
                color: dark ? '#94a3b8' : '#64748b'
            },
            smooth: {
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
    networkInstance.once('stabilizationIterationsDone', function () {
        networkInstance.setOptions({ physics: { enabled: false } });
        isPhysicsLocked = true;
        const lockBtn = document.getElementById('btn-toggle-physics');
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
            togglePhysicsBtn.innerHTML = isPhysicsLocked 
                ? '<i class="fa-solid fa-lock mr-1.5 text-xs"></i> Layout Fixed' 
                : '<i class="fa-solid fa-unlock mr-1.5 text-xs text-primary"></i> Physics Active';
        };
    }

    // Search and auto-focus
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            if (!query) return;

            const allNodes = graphDataset.nodes.get();
            const match = allNodes.find(n => (n.label && n.label.toLowerCase().includes(query)) || (n.id && n.id.toLowerCase().includes(query)));
            if (match) {
                networkInstance.selectNodes([match.id]);
                networkInstance.focus(match.id, {
                    scale: 1.4,
                    animation: { duration: 500, easingFunction: 'easeInOutQuad' }
                });
                renderForensicInspector(match, match.id);
            }
        });
    }

    // Filter by type
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const selected = e.target.value;
            if (selected === 'ALL') {
                graphDataset.nodes.clear();
                graphDataset.nodes.add(graphDataset.rawNodes);
            } else {
                const filtered = graphDataset.rawNodes.filter(n => n.group === selected);
                graphDataset.nodes.clear();
                graphDataset.nodes.add(filtered);
            }
            networkInstance.fit({ animation: { duration: 300 } });
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
                    <p class="font-medium text-text-main mb-1">Target Entity Dossier</p>
                    <p class="text-[11px] leading-relaxed">Select any node in the topology network to inspect metadata, unmasked clearnet records, and linked indicators.</p>
                </div>
            `;
        }
    });
}

function renderForensicInspector(node, nodeId) {
    const inspector = document.getElementById('graph-inspector-content');
    if (!inspector) return;

    const groupBadges = {
        'ACTOR': 'badge-high',
        'CLEARNET_IP': 'badge-high',
        'WALLET': 'badge-low',
        'HANDLE': 'badge-info',
        'PGP': 'badge-gray'
    };

    let content = `
        <div class="space-y-3.5 fade-in text-xs">
            <div class="flex items-center justify-between pb-2 border-b border-border-color">
                <span class="badge ${groupBadges[node.group] || 'badge-gray'} text-[10px] uppercase font-bold">${node.group || 'ENTITY'}</span>
                <span class="font-mono text-[10px] text-text-muted">${nodeId}</span>
            </div>

            <div>
                <span class="text-[10px] uppercase font-semibold text-text-muted block mb-0.5">Primary Identifier</span>
                <h4 class="font-bold text-text-main text-sm break-all">${node.label.replace('ORIGIN IP:\n', '')}</h4>
            </div>
    `;

    if (node.group === 'ACTOR') {
        content += `
            <div class="p-2.5 rounded-lg bg-surface-secondary/70 border border-border-color space-y-2">
                <div class="flex justify-between items-center"><span class="text-text-muted">Threat Classification:</span> <span class="font-bold text-rose-500">${node.threat_level || 'HIGH'}</span></div>
                <div class="flex justify-between items-center"><span class="text-text-muted">Attribution Confidence:</span> <span class="font-bold text-emerald-500">${node.confidence || 90}%</span></div>
                <div class="flex justify-between items-center"><span class="text-text-muted">Primary Category:</span> <span class="text-text-main font-medium">${node.category || 'Threat Group'}</span></div>
            </div>
            
            <div class="space-y-1">
                <span class="text-[10px] font-semibold text-text-muted uppercase">Intelligence Actions:</span>
                <button class="btn-primary w-full justify-center text-xs py-1.5" onclick="navigateTo('personas')">
                    <i class="fa-solid fa-user-shield text-xs"></i> Open Actor Dossier
                </button>
            </div>
        `;
    } else if (node.group === 'CLEARNET_IP') {
        content += `
            <div class="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 space-y-1.5 text-xs">
                <div class="font-bold text-warning text-xs flex items-center gap-1.5">
                    <i class="fa-solid fa-triangle-exclamation"></i> De-Anonymized Origin IP
                </div>
                <p class="text-[11px] text-text-muted leading-relaxed">Clearnet host unmasked via correlation between hidden service TLS SAN certs & Apache server-status scoreboard.</p>
                <div class="pt-1 flex justify-between text-[11px] text-text-main font-mono border-t border-amber-500/20">
                    <span>ISP: PrivateLayer (AS42831)</span>
                    <span>Bucharest, RO</span>
                </div>
            </div>

            <button class="btn-primary w-full justify-center text-xs py-1.5" onclick="navigateTo('infrastructure')">
                <i class="fa-solid fa-magnifying-glass text-xs"></i> Audit Origin Infrastructure
            </button>
        `;
    } else if (node.group === 'WALLET') {
        content += `
            <div class="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                <span class="font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1.5">
                    <i class="fa-solid fa-wallet"></i> Monitored Crypto Asset
                </span>
                <p class="text-[11px] text-text-muted">Ransomware & extortion transaction address indexed on ledger.</p>
            </div>
        `;
    }

    content += `</div>`;
    inspector.innerHTML = content;
}
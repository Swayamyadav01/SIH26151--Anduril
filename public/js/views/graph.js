function renderGraph(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                    <i class="fa-solid fa-diagram-project mr-3 text-primary"></i> Relationship Graph
                </h2>
                <p class="text-sm text-text-muted mt-1">Visualize connections between personas, infrastructure, wallets, and keys.</p>
            </div>
            <div class="flex space-x-3">
                <button class="bg-white border border-border-color text-gray-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm" id="btn-reset-zoom">
                    <i class="fa-solid fa-compress mr-2"></i> Reset Zoom
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
            <!-- Main Graph Area -->
            <div class="lg:col-span-3 bg-surface rounded-xl shadow-sm border border-border-color flex flex-col relative">
                <!-- Toolbar overlay -->
                <div class="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-border-color p-2 flex space-x-2">
                    <button class="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600" title="Zoom In" id="btn-zoom-in"><i class="fa-solid fa-plus"></i></button>
                    <button class="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-gray-600" title="Zoom Out" id="btn-zoom-out"><i class="fa-solid fa-minus"></i></button>
                </div>
                
                <!-- Legend overlay -->
                <div class="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur rounded-lg shadow-sm border border-border-color p-3 text-xs">
                    <div class="font-semibold text-gray-700 mb-2">Entity Types</div>
                    <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div class="flex items-center"><div class="w-3 h-3 rounded-full bg-red-500 mr-2"></div> Persona (Critical)</div>
                        <div class="flex items-center"><div class="w-3 h-3 rounded-full bg-amber-500 mr-2"></div> Persona (High)</div>
                        <div class="flex items-center"><div class="w-3 h-3 rotate-45 bg-blue-500 mr-2"></div> Handle</div>
                        <div class="flex items-center"><div class="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-purple-500 mr-2"></div> PGP Key</div>
                        <div class="flex items-center"><i class="fa-solid fa-star text-emerald-500 mr-2 text-[10px]"></i> Wallet</div>
                        <div class="flex items-center"><div class="w-3 h-3 bg-amber-500 mr-2"></div> Origin IP</div>
                    </div>
                </div>

                <div id="network-container" class="flex-1 rounded-xl border-none"></div>
            </div>

            <!-- Side Panel (Inspector) -->
            <div class="bg-surface rounded-xl shadow-sm border border-border-color flex flex-col">
                <div class="p-4 border-b border-border-color bg-gray-50/50 rounded-t-xl">
                    <h3 class="font-semibold text-gray-800"><i class="fa-solid fa-circle-info text-primary mr-2"></i> Inspector</h3>
                </div>
                <div class="flex-1 overflow-y-auto p-5" id="graph-inspector-content">
                    <div class="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <i class="fa-solid fa-hand-pointer text-3xl mb-3 text-gray-300"></i>
                        <p>Click on any node in the graph to view its details, relationships, and evidence.</p>
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
            
            initNetworkGraph(data.nodes, data.edges);
        } catch (err) {
            console.error(err);
            document.getElementById('network-container').innerHTML = `
                <div class="flex items-center justify-center h-full text-danger">
                    Failed to load graph data. Is the backend running?
                </div>
            `;
        }
    }, 100);
}

let network = null;

function initNetworkGraph(nodesData, edgesData) {
    const container = document.getElementById('network-container');
    if (!container) return;

    const data = {
        nodes: new vis.DataSet(nodesData),
        edges: new vis.DataSet(edgesData)
    };

    const options = {
        nodes: {
            font: {
                face: 'Inter',
                size: 12,
                color: '#334155'
            },
            borderWidth: 2,
            shadow: true
        },
        edges: {
            font: {
                face: 'Inter',
                size: 10,
                align: 'middle',
                color: '#64748b'
            },
            smooth: {
                type: 'continuous'
            },
            arrows: {
                to: { enabled: true, scaleFactor: 0.5 }
            }
        },
        physics: {
            forceAtlas2Based: {
                gravitationalConstant: -100,
                centralGravity: 0.01,
                springLength: 200,
                springConstant: 0.08
            },
            maxVelocity: 50,
            solver: 'forceAtlas2Based',
            timestep: 0.35,
            stabilization: { iterations: 150 }
        },
        interaction: {
            hover: true,
            tooltipDelay: 200
        }
    };

    network = new vis.Network(container, data, options);

    // Zoom controls
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        const scale = network.getScale();
        network.moveTo({ scale: scale * 1.2 });
    });
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        const scale = network.getScale();
        network.moveTo({ scale: scale / 1.2 });
    });
    document.getElementById('btn-reset-zoom').addEventListener('click', () => {
        network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    });

    // Node click event for inspector
    network.on("click", function (params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = data.nodes.get(nodeId);
            const connectedEdges = network.getConnectedEdges(nodeId);
            updateInspector(node, connectedEdges.length);
        } else {
            document.getElementById('graph-inspector-content').innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center text-gray-500 fade-in">
                    <i class="fa-solid fa-hand-pointer text-3xl mb-3 text-gray-300"></i>
                    <p>Click on any node in the graph to view its details, relationships, and evidence.</p>
                </div>
            `;
        }
    });
}

function updateInspector(node, edgeCount) {
    const container = document.getElementById('graph-inspector-content');
    
    let icon = 'fa-circle-dot';
    let typeClass = 'bg-gray-100 text-gray-600';
    let riskStr = '';

    if (node.group === 'ACTOR') {
        icon = 'fa-user-ninja';
        typeClass = 'bg-red-100 text-danger';
        riskStr = `
            <div class="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                <div class="text-xs text-red-500 font-semibold mb-1">THREAT LEVEL</div>
                <div class="font-bold text-danger">${node.threat_level}</div>
            </div>
        `;
    } else if (node.group === 'HANDLE') {
        icon = 'fa-id-card';
        typeClass = 'bg-blue-100 text-blue-600';
    } else if (node.group === 'PGP') {
        icon = 'fa-key';
        typeClass = 'bg-purple-100 text-purple-600';
    } else if (node.group === 'WALLET') {
        icon = 'fa-bitcoin';
        typeClass = 'bg-emerald-100 text-emerald-600';
    } else if (node.group === 'CLEARNET_IP') {
        icon = 'fa-server';
        typeClass = 'bg-amber-100 text-amber-600';
    }

    container.innerHTML = `
        <div class="fade-in">
            <div class="flex items-center mb-4 pb-4 border-b border-gray-100">
                <div class="w-10 h-10 rounded-lg ${typeClass} flex items-center justify-center text-lg mr-3 shadow-sm">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div>
                    <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider">${node.group.replace('_', ' ')}</div>
                    <div class="font-bold text-gray-800 break-all">${node.label.replace('\n', ' ')}</div>
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <div class="text-xs text-gray-500 mb-1">Entity ID</div>
                    <div class="font-mono text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 break-all">${node.id}</div>
                </div>
                
                <div class="flex items-center justify-between border-t border-b border-gray-100 py-3">
                    <span class="text-sm text-gray-600">Connected Entities</span>
                    <span class="font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full text-xs">${edgeCount}</span>
                </div>
                
                ${riskStr}
                
                ${node.confidence ? `
                <div class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-xs text-gray-500 font-semibold uppercase">Confidence</span>
                        <span class="text-xs font-bold text-success">${node.confidence}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-1.5">
                        <div class="bg-success h-1.5 rounded-full" style="width: ${node.confidence}%"></div>
                    </div>
                </div>
                ` : ''}

                <button class="w-full mt-6 bg-white border border-primary text-primary hover:bg-primary hover:text-white transition-colors py-2 rounded-md font-medium text-sm">
                    <i class="fa-solid fa-magnifying-glass-plus mr-2"></i> Investigate Entity
                </button>
            </div>
        </div>
    `;
}

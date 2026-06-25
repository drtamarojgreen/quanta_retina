document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const canvas = document.getElementById('canvas'),
        world = document.getElementById('world'),
        paletteNodes = document.querySelectorAll('.palette-node'),
        exportBtn = document.getElementById('export-btn'),
        importBtn = document.getElementById('import-btn'),
        executeBtn = document.getElementById('execute-btn'),
        propertiesPanel = document.getElementById('properties-panel'),
        propertiesContent = document.getElementById('properties-content'),
        nodePropertiesTemplate = document.getElementById('node-properties-template'),
        logContent = document.getElementById('log-content'),
        clearLogBtn = document.getElementById('clear-log-btn'),
        contextMenu = document.getElementById('context-menu'),
        contextDelete = document.getElementById('context-delete'),
        tooltip = document.getElementById('tooltip');

    // --- Descriptions Store ---
    const descriptions = {
        quanta_porto: "A framework for developing and interacting with local LLMs. It features a sandboxed cognitive environment and a custom command language called PQL (QuantaPorto Language) to issue structured tasks to the model. It emphasizes offline autonomy, rule-based guidance with philosophical consequences, and includes a comprehensive ethics and bias detection system.",
        quanta_synapse: "The central communication bus for the Quanta ecosystem. It acts as a C++ and Python connector tool, providing a unified interface for asynchronous, message-based communication and data exchange between all the different `quanta_*` modules. It enforces a standardized XML data format and integrates with `quanta_ethos` for policy validation.",
        quanta_glia: "A subsystem designed to autonomously manage knowledge repositories. It simulates the behavior of biological glial cells by intelligently spawning new repositories to fill knowledge gaps and pruning old or redundant ones to maintain system health. It is the primary entry point for setting up and testing the entire PrismQuanta ecosystem.",
        quanta_tissu: "A minimal, transformer-based language model inference engine built in Python with NumPy. It serves as an educational tool and the foundation for an agentic coding assistant. It includes `TissLang`, a declarative language for orchestrating agent workflows, and `TissDB`, a high-performance NoSQL database written in C++.",
        quanta_alarma: "A proactive monitoring and advisory system for LLM agent outputs. It acts as a real-time alert system for anomalous or risky activities by using anomaly detection and risk scoring to provide a critical layer of oversight for autonomous AI systems.",
        quanta_cerebra: "A high-performance C++17 application that simulates and visualizes brain activity by generating real-time, ASCII-based video animations from JSON input. It is built with zero external dependencies and serves as a foundation for experimenting with advanced graphics modeling on limited resources.",
        quanta_cogno: "A C++ application that provides a simulated API for exploring the relationship between genomics and mental health. Built with no external dependencies, it offers endpoints for querying gene data, analyzing pathways, and assessing drug-gene interactions, and includes a from-scratch BDD testing framework.",
        quanta_dorsa: "An end-to-end pipeline for neuroscientific modeling. It integrates a high-performance C++ simulation core, Python-based dynamic plotting with `matplotlib`, R-powered statistical analysis with `ggplot2`, and video composition via `FFmpeg` to simulate, visualize, and analyze brain regions and synaptic plasticity.",
        quanta_ethos: "This repository contains the guiding philosophy and ethical framework for the entire `PrismQuanta` ecosystem. It outlines the project's vision for a local-first, modular, and ethically-governed AI, and details the roles of the various `quanta_*` modules. It serves as the non-bypassable conscience for all system actions.",
        quanta_lista: "An intelligent coordination and management layer for multi-agent LLM systems. It acts as a central nervous system, providing dynamic task scheduling, prioritization, and multi-agent coordination to prevent redundant work and optimize collective workflows. The architecture is distributed across multiple repositories.",
        quanta_memora: "A powerful C++ project template generator that creates well-structured, modern C++17 projects. It supports multiple configurations including console applications, libraries, and GUI applications, and integrates build systems like CMake and Makefiles, along with unit testing frameworks.",
        quanta_occipita: "A developer tool written in PowerShell designed to bootstrap new QuantaSoft modules. It accelerates development by generating standardized boilerplate code, YAML configuration files, documentation, Git repositories, issue templates, and unit test skeletons to ensure consistency across the project.",
        quanta_pulsa: "A sophisticated monitoring and advisory tool to ensure the reliability and ethical performance of LLM agents. It continuously measures response coherence, latency, and internal consistency to detect and flag potential hallucinations or \"fibbing\" in real-time, providing an essential layer of oversight.",
        quanta_quilida: "A monitoring and advisory application that performs rigorous quality control on LLM-generated content. It ensures factual accuracy, reduces bias, and verifies alignment by cross-referencing outputs with trusted data sources, providing essential oversight for multi-agent systems.",
        quanta_retina: "A C++ console application for Windows that demonstrates the rendering of a 3D undirected network graph in an ASCII terminal. It simulates depth by varying node sizes and uses occlusion to create a simple but effective visual representation of graph structures.",
        quanta_sensa: "An autonomous workflow AI agent framework for resilient, self-aware operation in constrained Linux environments. It uses a C++ parent controller to schedule and monitor a Python agent that executes single, discrete actions and learns exclusively from local resources like man pages, emphasizing security and stability.",
        quanta_serene: "A C++ application for managing conflicting tasks between AI agents. It provides a framework for prioritizing tasks, resolving scheduling conflicts by checking dependencies, and managing agent status (`IDLE`, `BUSY`) to ensure smooth and efficient multi-agent operations.",
        reactome_layer: "An integration layer with the Reactome pathway database. It maps biological pathways, reaction networks, and genetic associations to aid in neuroscientific and psychiatric research workflows.",
        rdf_knowledge_graph: "A semantic knowledge graph storing system metadata, research findings, and agent evidence as RDF triples. It enables rich semantic relations and cross-domain queries.",
        sparql_engine: "A query engine optimized for executing SPARQL queries against the system's RDF Knowledge Graph. It provides semantic search, pattern matching, and inference capabilities.",
        ml_pipeline: "An orchestration pipeline for training and running machine learning models in the Greenhouse ecosystem. It processes clinical, behavioral, and biological data streams.",
        tf_analytics: "A high-performance analytics engine built on TensorFlow for statistical modeling, neural network inference, and deep learning analytics of biomedical data.",
        blender_pipeline: "An automated pipeline for importing, processing, and generating 3D brain models and pathway visualizations using Blender API scripts and custom assets.",
        pathway_viewer: "An interactive visualizer for biochemical and neural pathways. It maps genes, proteins, and metabolites to functional networks in a user-friendly diagram.",
        custom_3d_engine: "A custom 3D graphics engine for rendering real-time, interactive brain connectome networks, pathway structures, and neuron models in the browser."
    };

    // --- Default Workflow ---
    const defaultWorkflow = {
        nodes: [
            { id: 'node-0', type: 'quanta_porto', left: '200px', top: '150px', title: 'Input Data' },
            { id: 'node-1', type: 'quanta_synapse', left: '500px', top: '150px', title: 'Process Step' },
            { id: 'node-2', type: 'quanta_cerebra', left: '800px', top: '150px', title: 'Output Result' }
        ],
        connections: [
            { id: 'conn-node-0-node-1', from: 'node-0', to: 'node-1' },
            { id: 'conn-node-1-node-2', from: 'node-1', to: 'node-2' }
        ]
    };

    // --- State Management ---
    let nodeIdCounter = 0, connections = [], draggedElement = null, selectedElement = null, isDrawingConnection = false, connectionStartPort = null, previewPath = null, isPanning = false, isSpacebarDown = false, panStart = { x: 0, y: 0 }, view = { x: 0, y: 0, scale: 1 }, contextTarget = null;

    function saveToLocalStorage() {
        const nodes = Array.from(document.querySelectorAll('.workflow-node')).map(n => {
            const img = n.querySelector('img');
            const titleEl = n.querySelector('h3') || n.querySelector('.text-content');
            return {
                id: n.id,
                type: n.dataset.nodeType,
                left: n.style.left,
                top: n.style.top,
                width: n.style.width,
                height: n.style.height,
                title: titleEl ? titleEl.textContent : '',
                src: img ? img.getAttribute('src') : undefined
            };
        });
        const workflow = { nodes, connections };
        localStorage.setItem('quantagraph_workflow', JSON.stringify(workflow));
    }

    // --- SVG Setup ---
    const svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svgLayer.id = 'svg-layer'; world.appendChild(svgLayer);
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.id = 'arrowhead'; marker.setAttribute('viewBox', '-0 -5 10 10'); marker.setAttribute('refX', 8); marker.setAttribute('refY', 0); marker.setAttribute('orient', 'auto'); marker.setAttribute('markerWidth', 8); marker.setAttribute('markerHeight', 8); marker.setAttribute('xoverflow', 'visible');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 0,-5 L 10 ,0 L 0,5'); path.setAttribute('fill', '#5a9bd5'); path.style.stroke = 'none';
    marker.appendChild(path); defs.appendChild(marker); svgLayer.appendChild(defs);

    // --- Event Listeners ---
    paletteNodes.forEach(node => {
        node.addEventListener('dragstart', handlePaletteDragStart);
        node.addEventListener('mouseenter', showTooltip);
        node.addEventListener('mouseleave', hideTooltip);
        node.addEventListener('mousemove', moveTooltip);
    });
    canvas.addEventListener('dragover', e => e.preventDefault());
    canvas.addEventListener('drop', handleCanvasDrop);
    canvas.addEventListener('dragstart', handleCanvasDragStart);
    canvas.addEventListener('dragend', handleCanvasDragEnd);
    canvas.addEventListener('mousedown', handleCanvasMouseDown, true);
    window.addEventListener('mousemove', handleCanvasMouseMove);
    window.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('mouseleave', handleCanvasMouseLeave);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('contextmenu', handleContextMenu);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('click', () => hideContextMenu());
    exportBtn.addEventListener('click', exportWorkflow);
    importBtn.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const workflow = JSON.parse(event.target.result);
                    loadWorkflow(workflow);
                    saveToLocalStorage();
                    addLogMessage('SUCCESS', `Workflow imported successfully from ${file.name}`);
                } catch (err) {
                    addLogMessage('ERROR', 'Failed to parse the imported JSON file.');
                }
            };
            reader.readAsText(file);
        });
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
    executeBtn.addEventListener('click', simulateExecution);
    clearLogBtn.addEventListener('click', () => { logContent.innerHTML = ''; });
    contextDelete.addEventListener('click', deleteContextTarget);

    // --- Tooltip Handlers ---
    function showTooltip(event) {
        const nodeType = event.target.dataset.nodeType;
        const description = descriptions[nodeType];
        if (description) {
            tooltip.innerHTML = description;
            tooltip.classList.remove('hidden');
            moveTooltip(event);
        }
    }
    function hideTooltip() {
        tooltip.classList.add('hidden');
    }
    function moveTooltip(event) {
        tooltip.style.left = `${event.clientX + 15}px`;
        tooltip.style.top = `${event.clientY + 15}px`;
    }

    // --- Event Handlers & Core Logic ---
    function handlePaletteDragStart(event) { event.dataTransfer.setData('text/plain', event.target.dataset.nodeType); event.dataTransfer.effectAllowed = 'copy'; }
    function handleCanvasDrop(event) {
        event.preventDefault();
        const worldPos = screenToWorld(event.clientX, event.clientY);
        if (draggedElement) {
            // Fix: verify that we are actually in a dragging state
            if (!draggedElement.classList.contains('dragging')) {
                draggedElement = null;
                return;
            }
            const offsetX = parseFloat(draggedElement.dataset.dragOffsetX || 0);
            const offsetY = parseFloat(draggedElement.dataset.dragOffsetY || 0);
            draggedElement.style.left = `${Math.round((worldPos.x - offsetX) / 20) * 20}px`;
            draggedElement.style.top = `${Math.round((worldPos.y - offsetY) / 20) * 20}px`;
            // Use rAF to ensure layout is flushed before recalculating port positions
            const movedId = draggedElement.id;
            requestAnimationFrame(() => {
                updateConnectionsForNode(movedId);
                reconcileDOMWithState();
                saveToLocalStorage();
            });
        } else {
            const nodeType = event.dataTransfer.getData('text/plain');
            if (nodeType) {
                createNodeOnCanvas({ type: nodeType, worldX: worldPos.x, worldY: worldPos.y });
            }
        }
    }
    function handleCanvasDragStart(event) {
        const port = event.target.closest('.connection-port');
        if (port) {
            event.stopPropagation();
            event.preventDefault();
            return false;
        }
        const node = event.target.closest('.workflow-node');
        if (node) {
            draggedElement = node;
            const worldPos = screenToWorld(event.clientX, event.clientY);
            const nodeX = parseFloat(draggedElement.style.left);
            const nodeY = parseFloat(draggedElement.style.top);
            draggedElement.dataset.dragOffsetX = worldPos.x - nodeX;
            draggedElement.dataset.dragOffsetY = worldPos.y - nodeY;
            setTimeout(() => { if (draggedElement) draggedElement.classList.add('dragging') }, 0);
        }
    }
    function handleCanvasDragEnd() { if (draggedElement) { draggedElement.classList.remove('dragging'); draggedElement = null; } }
    function handleCanvasMouseDown(event) {
        hideContextMenu();
        const portEl = event.target.closest('.connection-port');
        if (portEl) {
            event.preventDefault();
            event.stopPropagation();
            if (previewPath) previewPath.remove();
            isDrawingConnection = true;
            connectionStartPort = portEl;
            canvas.style.cursor = 'crosshair';
            previewPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            previewPath.setAttribute('stroke-dasharray', '5,5');
            previewPath.setAttribute('marker-end', 'url(#arrowhead)');
            svgLayer.appendChild(previewPath);
        } else if (event.buttons === 1 && (isSpacebarDown || !event.target.closest('.workflow-node'))) {
            isPanning = true;
            panStart.x = event.clientX;
            panStart.y = event.clientY;
            canvas.classList.add('panning');
        }
    }
    function handleCanvasMouseMove(event) { const worldPos = screenToWorld(event.clientX, event.clientY); if (isDrawingConnection) { const startPos = getPortCenter(connectionStartPort); previewPath.setAttribute('d', `M${startPos.x},${startPos.y} C${startPos.x + 50},${startPos.y} ${worldPos.x - 50},${worldPos.y} ${worldPos.x},${worldPos.y}`); } else if (isPanning) { const dx = event.clientX - panStart.x; const dy = event.clientY - panStart.y; view.x += dx; view.y += dy; panStart.x = event.clientX; panStart.y = event.clientY; updateWorldTransform(); } }
    function handleCanvasMouseLeave() { isPanning = false; canvas.classList.remove('panning'); }
    function handleCanvasMouseUp(event) {
        if (isDrawingConnection) {
            const endPort = event.target.closest('.connection-port');
            if (endPort && endPort.parentElement.id !== connectionStartPort.parentElement.id) {
                const fromId = connectionStartPort.parentElement.id;
                const toId = endPort.parentElement.id;

                // PR-1: Prevent duplicate connections
                const existing = connections.find(c => c.from === fromId && c.to === toId);
                if (existing) {
                    addLogMessage('WARN', `Connection already exists between ${fromId} and ${toId}`);
                    if (previewPath) previewPath.remove();
                } else {
                    const conn = {
                        id: `conn-${fromId}-${toId}`,
                        from: fromId,
                        to: toId,
                        type: 'data_flow' // Add default type
                    };
                    connections.push(conn);
                    const path = previewPath;
                    path.id = conn.id;
                    path.removeAttribute('stroke-dasharray');
                    updateConnectionPath(path, connectionStartPort, endPort, conn.type);
                    path.addEventListener('click', (e) => {
                        e.stopPropagation();
                        selectElement(path);
                    });
                    saveToLocalStorage();
                }
            } else {
                // PR-2: Ensure previewPath is removed if no connection is formed
                if (previewPath) previewPath.remove();
            }
            isDrawingConnection = false;
            previewPath = null;
            canvas.style.cursor = 'default';
            reconcileDOMWithState();
        }
        if (isPanning) {
            isPanning = false;
            canvas.classList.remove('panning');
        }
    }
    function handleCanvasClick(event) {
        const clickedNode = event.target.closest('.workflow-node');
        if (clickedNode) {
            selectElement(clickedNode);
        } else if (event.target.id === 'canvas' || event.target.id === 'world' || event.target.id === 'svg-layer') {
            selectElement(null);
        }
    }
    function handleKeyDown(event) { if (event.key === 'Delete' && selectedElement) { deleteSelected(); } if (event.code === 'Space' && !isSpacebarDown) { isSpacebarDown = true; event.preventDefault(); canvas.style.cursor = 'grab'; } }
    function handleKeyUp(event) { if (event.code === 'Space') { isSpacebarDown = false; canvas.style.cursor = 'default'; } }
    function handleWheel(event) { event.preventDefault(); const zoomIntensity = 0.1; const mousePos = { x: event.clientX, y: event.clientY }; const worldPosBeforeZoom = screenToWorld(mousePos.x, mousePos.y); if (event.deltaY < 0) view.scale = Math.min(3, view.scale * (1 + zoomIntensity)); else view.scale = Math.max(0.2, view.scale * (1 - zoomIntensity)); const worldPosAfterZoom = screenToWorld(mousePos.x, mousePos.y); view.x += (worldPosAfterZoom.x - worldPosBeforeZoom.x) * view.scale; view.y += (worldPosAfterZoom.y - worldPosBeforeZoom.y) * view.scale; updateWorldTransform(); }
    function handleContextMenu(event) { event.preventDefault(); const targetNode = event.target.closest('.workflow-node'); if (targetNode) { contextTarget = targetNode; contextMenu.style.top = `${event.clientY}px`; contextMenu.style.left = `${event.clientX}px`; contextMenu.classList.remove('hidden'); } }
    function hideContextMenu() { contextMenu.classList.add('hidden'); contextTarget = null; }
    function deleteContextTarget() { if (contextTarget) { deleteNode(contextTarget.id); saveToLocalStorage(); } hideContextMenu(); }

    function reconcileDOMWithState() {
        const existingIds = new Set(connections.map(c => c.id));
        if (previewPath && previewPath.id) existingIds.add(previewPath.id);

        // Reconcile paths
        Array.from(svgLayer.querySelectorAll('path[id^="conn-"]')).forEach(path => {
            if (!existingIds.has(path.id)) path.remove();
        });

        // Reconcile labels
        Array.from(svgLayer.querySelectorAll('text[id^="text-conn-"]')).forEach(text => {
            const connId = text.id.replace('text-', '');
            if (!existingIds.has(connId)) text.remove();
        });
    }

    // --- SVG Node Content Generators ---
    function getBrainSvgHTML() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 350" width="100%" height="100%" style="pointer-events:none;display:block;">
  <!-- Background -->
  <rect width="920" height="350" rx="18" fill="#0d1117" opacity="0.85"/>

  <!-- Brain outline left hemisphere -->
  <path d="M200 260 Q120 240 100 190 Q80 140 130 105 Q160 85 195 90 Q185 70 210 60 Q240 48 265 65 Q280 40 310 38 Q345 35 360 60 Q375 45 400 48 Q420 50 430 70 Q440 55 460 55 Q480 55 490 72 Q500 60 520 62 Q540 65 545 85 Q565 75 580 90 Q600 105 595 130 Q620 140 630 170 Q640 200 615 225 Q590 250 555 255 Q540 275 510 275 Q490 280 470 265 Q450 280 420 278 Q395 280 375 262 Q350 280 320 278 Q295 280 275 265 Q250 280 220 270 Z"
    fill="none" stroke="#7b68ee" stroke-width="2" opacity="0.7"/>

  <!-- Brain fissures -->
  <path d="M310 38 Q315 80 300 120 Q290 150 305 190 Q315 220 300 260" fill="none" stroke="#7b68ee" stroke-width="1.2" opacity="0.5" stroke-dasharray="4,3"/>
  <path d="M400 48 Q395 90 410 130 Q425 170 405 210 Q390 240 400 270" fill="none" stroke="#7b68ee" stroke-width="1.2" opacity="0.5" stroke-dasharray="4,3"/>
  <path d="M490 72 Q480 110 495 150 Q510 185 495 225 Q485 250 490 275" fill="none" stroke="#7b68ee" stroke-width="1.2" opacity="0.5" stroke-dasharray="4,3"/>

  <!-- Connectome nodes -->
  <circle cx="200" cy="140" r="7" fill="#7b68ee" opacity="0.9"/>
  <circle cx="260" cy="100" r="6" fill="#5a9bd5" opacity="0.9"/>
  <circle cx="320" cy="130" r="8" fill="#7b68ee" opacity="0.9"/>
  <circle cx="380" cy="90" r="6" fill="#20c997" opacity="0.9"/>
  <circle cx="440" cy="120" r="9" fill="#5a9bd5" opacity="0.9"/>
  <circle cx="500" cy="95" r="6" fill="#7b68ee" opacity="0.9"/>
  <circle cx="560" cy="130" r="7" fill="#20c997" opacity="0.9"/>
  <circle cx="610" cy="180" r="8" fill="#5a9bd5" opacity="0.9"/>
  <circle cx="320" cy="220" r="6" fill="#20c997" opacity="0.9"/>
  <circle cx="440" cy="240" r="7" fill="#7b68ee" opacity="0.9"/>
  <circle cx="560" cy="210" r="6" fill="#5a9bd5" opacity="0.9"/>
  <circle cx="230" cy="210" r="5" fill="#5a9bd5" opacity="0.8"/>

  <!-- Connectome edges -->
  <line x1="200" y1="140" x2="260" y2="100" stroke="#7b68ee" stroke-width="1" opacity="0.5"/>
  <line x1="260" y1="100" x2="320" y2="130" stroke="#5a9bd5" stroke-width="1" opacity="0.5"/>
  <line x1="320" y1="130" x2="380" y2="90" stroke="#20c997" stroke-width="1" opacity="0.5"/>
  <line x1="380" y1="90" x2="440" y2="120" stroke="#7b68ee" stroke-width="1" opacity="0.5"/>
  <line x1="440" y1="120" x2="500" y2="95" stroke="#5a9bd5" stroke-width="1" opacity="0.5"/>
  <line x1="500" y1="95" x2="560" y2="130" stroke="#7b68ee" stroke-width="1" opacity="0.5"/>
  <line x1="560" y1="130" x2="610" y2="180" stroke="#20c997" stroke-width="1" opacity="0.5"/>
  <line x1="320" y1="130" x2="320" y2="220" stroke="#7b68ee" stroke-width="1" opacity="0.4"/>
  <line x1="440" y1="120" x2="440" y2="240" stroke="#5a9bd5" stroke-width="1" opacity="0.4"/>
  <line x1="560" y1="130" x2="560" y2="210" stroke="#20c997" stroke-width="1" opacity="0.4"/>
  <line x1="200" y1="140" x2="230" y2="210" stroke="#5a9bd5" stroke-width="1" opacity="0.4"/>
  <line x1="320" y1="220" x2="440" y2="240" stroke="#7b68ee" stroke-width="1" opacity="0.4"/>
  <line x1="440" y1="240" x2="560" y2="210" stroke="#5a9bd5" stroke-width="1" opacity="0.4"/>
  <line x1="610" y1="180" x2="560" y2="210" stroke="#20c997" stroke-width="1" opacity="0.4"/>

  <!-- Labels -->
  <text x="460" y="320" text-anchor="middle" fill="#7b68ee" font-size="13" font-family="Inter, sans-serif" opacity="0.9" font-weight="600">Brain Connectome — Neural Pathway Visualization</text>
  <text x="460" y="338" text-anchor="middle" fill="#aaa" font-size="10" font-family="Inter, sans-serif" opacity="0.7">Greenhouse Mental Health Research Platform</text>
</svg>`;
    }

    function getSorrelRingSvgHTML() {
        const phases = [
            { label: 'Specify',   angle: -90,  color: '#7b68ee' },
            { label: 'Observe',   angle: -30,  color: '#5a9bd5' },
            { label: 'Research',  angle:  30,  color: '#20c997' },
            { label: 'Refine',    angle:  90,  color: '#f0a500' },
            { label: 'Execute',   angle: 150,  color: '#e05a4e' },
            { label: 'Learn',     angle: 210,  color: '#c084fc' }
        ];
        const cx = 200, cy = 200, r = 140, nr = 18;
        const toRad = d => d * Math.PI / 180;
        let circles = '', labels = '', lines = '';
        phases.forEach((p, i) => {
            const x = cx + r * Math.cos(toRad(p.angle));
            const y = cy + r * Math.sin(toRad(p.angle));
            const next = phases[(i + 1) % phases.length];
            const nx = cx + r * Math.cos(toRad(next.angle));
            const ny = cy + r * Math.sin(toRad(next.angle));
            lines   += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="${p.color}" stroke-width="1.5" opacity="0.5"/>`;
            circles += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${nr}" fill="${p.color}" opacity="0.85"/>`;
            const lx = cx + (r + 30) * Math.cos(toRad(p.angle));
            const ly = cy + (r + 30) * Math.sin(toRad(p.angle));
            labels  += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" fill="#eee" font-size="11" font-family="Inter,sans-serif" font-weight="600">${p.label}</text>`;
        });
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%" style="pointer-events:none;display:block;">
  <rect width="400" height="400" rx="200" fill="#0d1117" opacity="0.8"/>
  <circle cx="${cx}" cy="${cy}" r="${r + nr + 40}" fill="none" stroke="#7b68ee" stroke-width="1" opacity="0.2" stroke-dasharray="6,4"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#7b68ee" stroke-width="0.5" opacity="0.15"/>
  ${lines}
  ${circles}
  ${labels}
  <text x="${cx}" y="${cy - 10}" text-anchor="middle" fill="#fff" font-size="13" font-family="Inter,sans-serif" font-weight="700">SORREL</text>
  <text x="${cx}" y="${cy + 10}" text-anchor="middle" fill="#aaa" font-size="10" font-family="Inter,sans-serif">SDD Cycle</text>
</svg>`;
    }

    function createNodeOnCanvas({id, type, left, top, worldX, worldY, title, src, width, height}) {
        const newNode = document.createElement('div');
        let isNewNode = false;
        if (id === undefined) {
            isNewNode = true;
            newNode.id = `node-${nodeIdCounter++}`;
            newNode.style.left = `${Math.round((worldX - 75) / 20) * 20}px`;
            newNode.style.top = `${Math.round((worldY - 25) / 20) * 20}px`;
        } else {
            newNode.id = id;
            const numericId = parseInt(id.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(numericId)) {
                nodeIdCounter = Math.max(nodeIdCounter, numericId + 1);
            }
            newNode.style.left = left;
            newNode.style.top = top;
        }
        newNode.className = `workflow-node ${type}`;

        if (type === 'text_box') {
            newNode.innerHTML = `<div class="text-content">${title || 'Text Box'}</div>`;
        } else if (type === 'logo' || type === 'background') {
            newNode.innerHTML = `<img src="${src || ''}" style="width:100%; height:100%; pointer-events:none; display:block;">`;
            if (!width) newNode.style.width = '100px';
            if (!height) newNode.style.height = '100px';
        } else if (type === 'brain_connectome') {
            newNode.innerHTML = getBrainSvgHTML();
            if (!width) newNode.style.width = '920px';
            if (!height) newNode.style.height = '350px';
        } else if (type === 'sorrel_ring') {
            newNode.innerHTML = getSorrelRingSvgHTML();
            if (!width) newNode.style.width = '400px';
            if (!height) newNode.style.height = '400px';
        } else {
            newNode.innerHTML = `<h3>${title || type}</h3>`;
        }

        if (width) newNode.style.width = width;
        if (height) newNode.style.height = height;

        newNode.setAttribute('draggable', 'true');

        if (type !== 'text_box' && type !== 'background' && type !== 'brain_connectome' && type !== 'sorrel_ring') {
            ['input', 'output'].forEach(portType => {
                const port = document.createElement('div');
                port.className = `connection-port ${portType}`;
                port.setAttribute('draggable', 'false');
                port.addEventListener('dragstart', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                });
                newNode.appendChild(port);
            });
        }

        if (isNewNode) {
            saveToLocalStorage();
        }

        // Add tooltip event listeners
        newNode.addEventListener('mouseenter', showTooltip);
        newNode.addEventListener('mouseleave', hideTooltip);
        newNode.addEventListener('mousemove', moveTooltip);
        newNode.dataset.nodeType = type;

        world.appendChild(newNode);
    }
    function selectElement(element) { if (selectedElement) selectedElement.classList.remove('selected'); selectedElement = element; if (selectedElement) { selectedElement.classList.add('selected'); } updatePropertiesPanel(); }
    function deleteNode(nodeId) { const node = document.getElementById(nodeId); if (node) node.remove(); const conns = connections.filter(c => c.from === nodeId || c.to === nodeId); conns.forEach(c => deleteConnection(c.id)); }
    function deleteConnection(connId) {
        const connEl = document.getElementById(connId);
        if (connEl) connEl.remove();
        const textEl = document.getElementById(`text-${connId}`);
        if (textEl) textEl.remove();
        connections = connections.filter(c => c.id !== connId);
        saveToLocalStorage();
    }
    function deleteSelected() { if (selectedElement) { if (selectedElement.tagName === 'path') { deleteConnection(selectedElement.id); } else if (selectedElement.classList.contains('workflow-node')) { deleteNode(selectedElement.id); } selectElement(null); saveToLocalStorage(); } }
    function updatePropertiesPanel() {
        propertiesContent.innerHTML = '';
        if (selectedElement) {
            propertiesPanel.classList.remove('hidden');
            if (selectedElement.classList.contains('workflow-node')) {
                const nodeType = selectedElement.dataset.nodeType;
                const template = nodePropertiesTemplate.content.cloneNode(true);
                const titleInput = template.getElementById('prop-title');
                const titleElement = selectedElement.querySelector('h3') || selectedElement.querySelector('.text-content');
                titleInput.value = titleElement ? titleElement.textContent : '';
                titleInput.addEventListener('input', (e) => {
                    if (titleElement) titleElement.textContent = e.target.value;
                    saveToLocalStorage();
                });
                propertiesContent.appendChild(template);

                if (nodeType === 'logo' || nodeType === 'background') {
                    const srcDiv = document.createElement('div');
                    srcDiv.className = 'property';
                    const img = selectedElement.querySelector('img');
                    srcDiv.innerHTML = `<label>Image Source</label><input type="text" class="property-input" value="${img ? img.getAttribute('src') : ''}">`;
                    srcDiv.querySelector('input').addEventListener('input', (e) => {
                        if (img) img.setAttribute('src', e.target.value);
                        saveToLocalStorage();
                    });
                    propertiesContent.appendChild(srcDiv);
                }

                ['width', 'height'].forEach(prop => {
                    const div = document.createElement('div');
                    div.className = 'property';
                    div.innerHTML = `<label>${prop.charAt(0).toUpperCase() + prop.slice(1)}</label><input type="text" class="property-input" value="${selectedElement.style[prop] || ''}">`;
                    div.querySelector('input').addEventListener('input', (e) => {
                        selectedElement.style[prop] = e.target.value;
                        updateConnectionsForNode(selectedElement.id);
                        saveToLocalStorage();
                    });
                    propertiesContent.appendChild(div);
                });

                const description = descriptions[nodeType];
                if (description) {
                    const descContainer = document.createElement('div');
                    descContainer.className = 'property';
                    const descLabel = document.createElement('label');
                    descLabel.textContent = 'Description';
                    const descText = document.createElement('p');
                    descText.textContent = description;
                    descText.className = 'property-description';
                    descContainer.appendChild(descLabel);
                    descContainer.appendChild(descText);
                    propertiesContent.appendChild(descContainer);
                }
            } else if (selectedElement.tagName === 'path') {
                const conn = connections.find(c => c.id === selectedElement.id);
                if (conn) {
                    const template = document.getElementById('edge-properties-template').content.cloneNode(true);
                    const typeSelect = template.getElementById('prop-edge-type');
                    typeSelect.value = conn.type;
                    typeSelect.addEventListener('change', (e) => {
                        conn.type = e.target.value;
                        const startPort = document.getElementById(conn.from).querySelector('.output');
                        const endPort = document.getElementById(conn.to).querySelector('.input');
                        updateConnectionPath(selectedElement, startPort, endPort, conn.type);
                        saveToLocalStorage();
                    });
                    propertiesContent.appendChild(template);
                }
            }
        } else {
            propertiesPanel.classList.add('hidden');
            propertiesContent.innerHTML = '<p class="no-selection">Select a node or edge to edit its properties.</p>';
        }
    }
    function updateWorldTransform() { world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`; }
    function screenToWorld(screenX, screenY) { const r = canvas.getBoundingClientRect(); return { x: (screenX - r.left - view.x) / view.scale, y: (screenY - r.top - view.y) / view.scale }; }
    function getPortCenter(port) {
        // Use getBoundingClientRect so CSS transforms (translateY(-50%) etc.) are accounted for
        const rect = port.getBoundingClientRect();
        return screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    function updateConnectionPath(path, startPort, endPort, type) {
        path.setAttribute('marker-end', 'url(#arrowhead)');
        path.setAttribute('class', `connection-${type}`);
        const s = getPortCenter(startPort);
        const e = getPortCenter(endPort);
        path.setAttribute('d', `M${s.x},${s.y} C${s.x + 50},${s.y} ${e.x - 50},${e.y} ${e.x},${e.y}`);

        let text = document.getElementById(`text-${path.id}`);
        if (!text) {
            text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.id = `text-${path.id}`;
            const textPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
            textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${path.id}`);
            textPath.setAttribute('startOffset', '50%');
            textPath.textContent = type.replace('_', ' ');
            text.appendChild(textPath);
            svgLayer.appendChild(text);
        } else {
            text.querySelector('textPath').textContent = type.replace('_', ' ');
        }
    }
    function updateConnectionsForNode(nodeId) {
        connections.forEach(c => {
            if (c.from === nodeId || c.to === nodeId) {
                const p = document.getElementById(c.id);
                if (p) {
                    const s = document.getElementById(c.from).querySelector('.output');
                    const e = document.getElementById(c.to).querySelector('.input');
                    updateConnectionPath(p, s, e, c.type);
                }
            }
        });
    }

    function loadWorkflow(workflow) {
        // Clear existing workflow
        world.querySelectorAll('.workflow-node').forEach(n => n.remove());
        Array.from(svgLayer.children).forEach(child => {
            if (child.tagName !== 'defs') child.remove();
        });
        connections.length = 0;
        nodeIdCounter = 0;

        // Load nodes
        if (workflow.nodes) {
            workflow.nodes.forEach(nodeData => {
                createNodeOnCanvas(nodeData);
            });
        }

        // Load connections
        if (workflow.connections) {
            workflow.connections.forEach(connData => {
                const { id, from, to, type } = connData;
                const fromNode = document.getElementById(from);
                const toNode = document.getElementById(to);
                const startPort = fromNode ? fromNode.querySelector('.output') : null;
                const endPort = toNode ? toNode.querySelector('.input') : null;

                if (startPort && endPort) {
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.id = id;
                    connections.push(connData); // Add to state
                    svgLayer.appendChild(path);
                    updateConnectionPath(path, startPort, endPort, type);
                    path.addEventListener('click', (e) => {
                        e.stopPropagation();
                        selectElement(path);
                    });
                }
            });
        }
    }
    function exportWorkflow() {
        const nodes = Array.from(document.querySelectorAll('.workflow-node')).map(n => {
            const img = n.querySelector('img');
            const titleEl = n.querySelector('h3') || n.querySelector('.text-content');
            return {
                id: n.id,
                type: n.dataset.nodeType,
                left: n.style.left,
                top: n.style.top,
                width: n.style.width,
                height: n.style.height,
                title: titleEl ? titleEl.textContent : '',
                src: img ? img.getAttribute('src') : undefined
            };
        });
        const workflow = { nodes, connections };
        const dataStr = JSON.stringify(workflow, null, 2);
        const dataBlob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'workflow.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addLogMessage('SUCCESS', 'Workflow exported to workflow.json');
    }
    function addLogMessage(level, message) { const e = document.createElement('div'); const t = new Date().toLocaleTimeString(); e.innerHTML = `[${t}] [${level}] ${message}`; logContent.appendChild(e); logContent.scrollTop = logContent.scrollHeight; }
    function simulateExecution() {
        logContent.innerHTML = '';
        addLogMessage('INFO', 'Starting workflow execution simulation...');
        const nodes = Array.from(document.querySelectorAll('.workflow-node'));
        if (nodes.length === 0) { addLogMessage('WARN', 'Workflow is empty. Nothing to execute.'); return; }
        addLogMessage('INFO', `Publishing workflow with ${nodes.length} nodes and ${connections.length} connections to quanta_synapse...`);
        let delay = 1000;
        setTimeout(() => addLogMessage('INFO', 'Received: quanta_porto acknowledged job.'), delay);
        nodes.forEach(node => {
            delay += Math.random() * 1000 + 500;
            const titleEl = node.querySelector('h3') || node.querySelector('.text-content');
            const label = titleEl ? titleEl.textContent : (node.dataset.nodeType || node.id);
            setTimeout(() => addLogMessage('INFO', `Executing node: ${label} (${node.id})`), delay);
        });
        delay += 1500;
        setTimeout(() => addLogMessage('SUCCESS', 'Workflow simulation finished successfully.'), delay);
    }

    const demoWorkflow = {
        nodes: [
            // Title section
            { id: 'title-1', type: 'text_box', left: '450px', top: '20px', title: 'TJG Web Services, LLC' },
            { id: 'title-2', type: 'text_box', left: '450px', top: '55px', title: 'Sorrel Driven Development Platform' },
            { id: 'title-3', type: 'text_box', left: '150px', top: '90px', width: '900px', title: 'TJG Web Services applies AI-driven Sorrel Driven Development to manage web development and develop mental health research tools.' },

            // Layer labels
            { id: 'layer-agentic', type: 'text_box', left: '50px', top: '150px', title: 'AGENTIC INFRASTRUCTURE LAYER' },
            { id: 'layer-knowledge', type: 'text_box', left: '50px', top: '300px', title: 'KNOWLEDGE INFRASTRUCTURE LAYER' },
            { id: 'layer-research', type: 'text_box', left: '50px', top: '495px', title: 'RESEARCH INFRASTRUCTURE LAYER' },

            // Decoratives
            { id: 'node-ring', type: 'sorrel_ring', left: '495px', top: '150px', width: '400px', height: '400px' },
            { id: 'node-brain', type: 'brain_connectome', left: '120px', top: '610px', width: '920px', height: '350px' },

            // Layer 1 Nodes (Agentic)
            { id: 'node-porto', type: 'quanta_porto', left: '430px', top: '200px', width: '140px', height: '50px', title: 'Quanta_Porto' },
            { id: 'node-allm', type: 'quanta_porto', left: '625px', top: '200px', width: '140px', height: '50px', title: 'AgenticLLMs' },
            { id: 'node-verification', type: 'quanta_porto', left: '770px', top: '200px', width: '130px', height: '50px', title: 'Verification' },
            { id: 'node-contentgen', type: 'quanta_porto', left: '1030px', top: '200px', width: '110px', height: '50px', title: 'Content Gen' },
            { id: 'node-humanreview', type: 'quanta_porto', left: '930px', top: '200px', width: '80px', height: '50px', title: 'Human Review' },

            // Layer 2 Nodes (Knowledge)
            { id: 'node-reactome', type: 'reactome_layer', left: '50px', top: '325px', width: '120px', height: '50px', title: 'Reactome Layer' },
            { id: 'node-rdf', type: 'rdf_knowledge_graph', left: '220px', top: '325px', width: '150px', height: '50px', title: 'RDF Knowledge Graph' },
            { id: 'node-sparql', type: 'sparql_engine', left: '220px', top: '385px', width: '150px', height: '50px', title: 'SPARQL Engine' },
            { id: 'node-memora', type: 'quanta_memora', left: '380px', top: '405px', width: '120px', height: '50px', title: 'Quanta_Memora' },
            { id: 'node-lllm', type: 'quanta_porto', left: '625px', top: '325px', width: '140px', height: '50px', title: 'localLLM' },
            { id: 'node-ethos', type: 'quanta_ethos', left: '1030px', top: '405px', width: '110px', height: '50px', title: 'Quanta_Ethos' },

            // Layer 3 Nodes (Research)
            { id: 'node-glia', type: 'quanta_glia', left: '65px', top: '525px', width: '120px', height: '50px', title: 'Quanta_Glia' },
            { id: 'node-tissu', type: 'quanta_tissu', left: '220px', top: '525px', width: '120px', height: '50px', title: 'Quanta_Tissu' },
            { id: 'node-mlpipeline', type: 'ml_pipeline', left: '380px', top: '525px', width: '120px', height: '50px', title: 'ML Pipeline' },
            { id: 'node-tfanalytics', type: 'tf_analytics', left: '625px', top: '525px', width: '140px', height: '50px', title: 'TF Analytics' },
            { id: 'node-pathwayviewer', type: 'pathway_viewer', left: '50px', top: '385px', width: '120px', height: '50px', title: 'Pathway Viewer' },
            { id: 'node-custom3d', type: 'custom_3d_engine', left: '810px', top: '525px', width: '140px', height: '50px', title: 'Custom 3D Engine' },
            { id: 'node-blender', type: 'blender_pipeline', left: '1030px', top: '525px', width: '110px', height: '50px', title: 'Blender Pipeline' },

            // Logos & Platform label
            { id: 'logo-greenhouse', type: 'logo', left: '980px', top: '810px', width: '80px', height: '85px', src: 'https://img.freepik.com/free-vector/greenhouse-logo-template-design_47987-14421.jpg', title: 'Greenhouse' },
            { id: 'logo-tjg', type: 'logo', left: '1080px', top: '810px', width: '80px', height: '85px', src: 'https://img.freepik.com/free-photo/abstract-blue-background-with-lines_23-2148285514.jpg', title: 'TJG Web Services' },
            { id: 'label-platform', type: 'text_box', left: '470px', top: '910px', title: 'Mental Health Development Platform' }
        ],
        connections: [
            // Knowledge Flows (Purple)
            { id: 'conn-glia-tissu', from: 'node-glia', to: 'node-tissu', type: 'purple_dashed' },
            { id: 'conn-memora-lllm', from: 'node-memora', to: 'node-lllm', type: 'purple_dashed' },
            { id: 'conn-rdf-allm', from: 'node-rdf', to: 'node-allm', type: 'purple_dashed' },
            { id: 'conn-sparql-lllm', from: 'node-sparql', to: 'node-lllm', type: 'purple_dashed' },
            { id: 'conn-tissu-porto', from: 'node-tissu', to: 'node-porto', type: 'purple_dashed' },
            { id: 'conn-ethos-lllm', from: 'node-ethos', to: 'node-lllm', type: 'purple_dashed' },

            // Data Flows (Blue)
            { id: 'conn-porto-lllm', from: 'node-porto', to: 'node-lllm', type: 'blue_flow' },
            { id: 'conn-lllm-allm', from: 'node-lllm', to: 'node-allm', type: 'blue_flow' },
            { id: 'conn-ml-tf', from: 'node-mlpipeline', to: 'node-tfanalytics', type: 'blue_flow' },
            { id: 'conn-reactome-rdf', from: 'node-reactome', to: 'node-rdf', type: 'blue_flow' },
            { id: 'conn-pathway-custom3d', from: 'node-pathwayviewer', to: 'node-custom3d', type: 'blue_flow' },

            // Validation Flows (Green)
            { id: 'conn-ethos-verify', from: 'node-ethos', to: 'node-verification', type: 'green_flow' },
            { id: 'conn-verify-allm', from: 'node-verification', to: 'node-allm', type: 'green_flow' },

            // Human Reviews (Orange)
            { id: 'conn-content-review', from: 'node-contentgen', to: 'node-humanreview', type: 'orange_flow' },
            { id: 'conn-review-verify', from: 'node-humanreview', to: 'node-verification', type: 'orange_flow' },

            // Constraint Gates (Red)
            { id: 'conn-blender-custom3d', from: 'node-blender', to: 'node-custom3d', type: 'red_flow' }
        ]
    };

    const saved = localStorage.getItem('quantagraph_workflow');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            loadWorkflow(parsed);
            addLogMessage('SUCCESS', 'Loaded saved workflow from local storage.');
        } catch (e) {
            console.error('Error loading saved workflow:', e);
            loadWorkflow(demoWorkflow);
        }
    } else {
        loadWorkflow(demoWorkflow);
    }
});

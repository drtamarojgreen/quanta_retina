document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const canvas = document.getElementById('canvas'), world = document.getElementById('world'), paletteNodes = document.querySelectorAll('.palette-node'), exportBtn = document.getElementById('export-btn'), importBtn = document.getElementById('import-btn'), executeBtn = document.getElementById('execute-btn'), propertiesPanel = document.getElementById('properties-panel'), propertiesContent = document.getElementById('properties-content'), nodePropertiesTemplate = document.getElementById('node-properties-template'), logContent = document.getElementById('log-content'), clearLogBtn = document.getElementById('clear-log-btn'), contextMenu = document.getElementById('context-menu'), contextDelete = document.getElementById('context-delete'), tooltip = document.getElementById('tooltip');

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
        quanta_serene: "A C++ application for managing conflicting tasks between AI agents. It provides a framework for prioritizing tasks, resolving scheduling conflicts by checking dependencies, and managing agent status (`IDLE`, `BUSY`) to ensure smooth and efficient multi-agent operations."
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
        node.addEventListener('mouseover', showTooltip);
        node.addEventListener('mouseout', hideTooltip);
        node.addEventListener('mousemove', moveTooltip);
    });
    canvas.addEventListener('dragover', e => e.preventDefault());
    canvas.addEventListener('drop', handleCanvasDrop);
    canvas.addEventListener('dragstart', handleCanvasDragStart);
    canvas.addEventListener('dragend', handleCanvasDragEnd);
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('mouseleave', handleCanvasMouseLeave);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('contextmenu', handleContextMenu);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('click', () => hideContextMenu());
    exportBtn.addEventListener('click', exportWorkflow);
    importBtn.addEventListener('click', () => addLogMessage('INFO', 'Import functionality not yet implemented.'));
    executeBtn.addEventListener('click', simulateExecution);
    clearLogBtn.addEventListener('click', () => { logContent.innerHTML = ''; });
    contextDelete.addEventListener('click', deleteContextTarget);

    updateWorldTransform();

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
    function handleCanvasDrop(event) { event.preventDefault(); const worldPos = screenToWorld(event.clientX, event.clientY); if (draggedElement) { const offsetX = parseFloat(draggedElement.dataset.dragOffsetX || 0); const offsetY = parseFloat(draggedElement.dataset.dragOffsetY || 0); draggedElement.style.left = `${Math.round((worldPos.x - offsetX) / 20) * 20}px`; draggedElement.style.top = `${Math.round((worldPos.y - offsetY) / 20) * 20}px`; updateConnectionsForNode(draggedElement.id); } else { const nodeType = event.dataTransfer.getData('text/plain'); if (nodeType) createNodeOnCanvas({ type: nodeType, worldX: worldPos.x, worldY: worldPos.y }); } }
    function handleCanvasDragStart(event) { const node = event.target.closest('.workflow-node'); if (node) { draggedElement = node; const worldPos = screenToWorld(event.clientX, event.clientY); const nodeX = parseFloat(draggedElement.style.left); const nodeY = parseFloat(draggedElement.style.top); draggedElement.dataset.dragOffsetX = worldPos.x - nodeX; draggedElement.dataset.dragOffsetY = worldPos.y - nodeY; setTimeout(() => { if (draggedElement) draggedElement.classList.add('dragging') }, 0); } }
    function handleCanvasDragEnd() { if (draggedElement) { draggedElement.classList.remove('dragging'); draggedElement = null; } }
    function handleCanvasMouseDown(event) { hideContextMenu(); if (event.target.classList.contains('connection-port')) { isDrawingConnection = true; connectionStartPort = event.target; canvas.style.cursor = 'crosshair'; previewPath = document.createElementNS('http://www.w3.org/2000/svg', 'path'); previewPath.setAttribute('stroke-dasharray', '5,5'); previewPath.setAttribute('marker-end', 'url(#arrowhead)'); svgLayer.appendChild(previewPath); } else if (isSpacebarDown && event.buttons === 1) { isPanning = true; panStart.x = event.clientX; panStart.y = event.clientY; canvas.classList.add('panning'); } }
    function handleCanvasMouseMove(event) { const worldPos = screenToWorld(event.clientX, event.clientY); if (isDrawingConnection) { const startPos = getPortCenter(connectionStartPort); previewPath.setAttribute('d', `M${startPos.x},${startPos.y} C${startPos.x + 50},${startPos.y} ${worldPos.x - 50},${worldPos.y} ${worldPos.x},${worldPos.y}`); } else if (isPanning) { const dx = event.clientX - panStart.x; const dy = event.clientY - panStart.y; view.x += dx; view.y += dy; panStart.x = event.clientX; panStart.y = event.clientY; updateWorldTransform(); } }
    function handleCanvasMouseLeave() { isPanning = false; canvas.classList.remove('panning'); }
    function handleCanvasMouseUp(event) { if (isDrawingConnection) { const endPort = event.target; if (endPort.classList.contains('connection-port') && endPort.parentElement.id !== connectionStartPort.parentElement.id) { const conn = { id: `conn-${connectionStartPort.parentElement.id}-${endPort.parentElement.id}`, from: connectionStartPort.parentElement.id, to: endPort.parentElement.id }; connections.push(conn); const path = previewPath; path.id = conn.id; path.removeAttribute('stroke-dasharray'); updateConnectionPath(path, connectionStartPort, endPort); path.addEventListener('click', (e) => { e.stopPropagation(); selectElement(path); }); } else { previewPath.remove(); } isDrawingConnection = false; previewPath = null; canvas.style.cursor = 'default'; } if (isPanning) { isPanning = false; canvas.classList.remove('panning'); } }
    function handleCanvasClick(event) { const clickedNode = event.target.closest('.workflow-node'); if (clickedNode) { selectElement(clickedNode); } else if (event.target.id === 'canvas' || event.target.id === 'world' || event.target.id === 'svg-layer') { selectElement(null); } }
    function handleKeyDown(event) { if (event.key === 'Delete' && selectedElement) { deleteSelected(); } if (event.code === 'Space' && !isSpacebarDown) { isSpacebarDown = true; event.preventDefault(); canvas.style.cursor = 'grab'; } }
    function handleKeyUp(event) { if (event.code === 'Space') { isSpacebarDown = false; canvas.style.cursor = 'default'; } }
    function handleWheel(event) { event.preventDefault(); const zoomIntensity = 0.1; const mousePos = { x: event.clientX, y: event.clientY }; const worldPosBeforeZoom = screenToWorld(mousePos.x, mousePos.y); if (event.deltaY < 0) view.scale = Math.min(3, view.scale * (1 + zoomIntensity)); else view.scale = Math.max(0.2, view.scale * (1 - zoomIntensity)); const worldPosAfterZoom = screenToWorld(mousePos.x, mousePos.y); view.x += (worldPosAfterZoom.x - worldPosBeforeZoom.x) * view.scale; view.y += (worldPosAfterZoom.y - worldPosBeforeZoom.y) * view.scale; updateWorldTransform(); }
    function handleContextMenu(event) { event.preventDefault(); const targetNode = event.target.closest('.workflow-node'); if (targetNode) { contextTarget = targetNode; contextMenu.style.top = `${event.clientY}px`; contextMenu.style.left = `${event.clientX}px`; contextMenu.classList.remove('hidden'); } }
    function hideContextMenu() { contextMenu.classList.add('hidden'); contextTarget = null; }
    function deleteContextTarget() { if (contextTarget) { deleteNode(contextTarget.id); } hideContextMenu(); }
    function createNodeOnCanvas({id, type, left, top, worldX, worldY, title}) { const newNode = document.createElement('div'); if (id === undefined) { newNode.id = `node-${nodeIdCounter++}`; newNode.style.left = `${Math.round((worldX - 75) / 20) * 20}px`; newNode.style.top = `${Math.round((worldY - 25) / 20) * 20}px`; } else { newNode.id = id; nodeIdCounter = Math.max(nodeIdCounter, parseInt(id.split('-')[1]) + 1); newNode.style.left = left; newNode.style.top = top; } newNode.className = `workflow-node ${type}`; newNode.innerHTML = `<h3>${title || type}</h3>`; newNode.setAttribute('draggable', 'true'); ['input', 'output'].forEach(portType => { const port = document.createElement('div'); port.className = `connection-port ${portType}`; newNode.appendChild(port); }); world.appendChild(newNode); }
    function selectElement(element) { if (selectedElement) selectedElement.classList.remove('selected'); selectedElement = element; if (selectedElement) { selectedElement.classList.add('selected'); } updatePropertiesPanel(); }
    function deleteNode(nodeId) { const node = document.getElementById(nodeId); if (node) node.remove(); const conns = connections.filter(c => c.from === nodeId || c.to === nodeId); conns.forEach(c => deleteConnection(c.id)); }
    function deleteConnection(connId) { const connEl = document.getElementById(connId); if (connEl) connEl.remove(); connections = connections.filter(c => c.id !== connId); }
    function deleteSelected() { if (selectedElement) { if (selectedElement.tagName === 'path') { deleteConnection(selectedElement.id); } else if (selectedElement.classList.contains('workflow-node')) { deleteNode(selectedElement.id); } selectElement(null); } }
    function updatePropertiesPanel() { propertiesContent.innerHTML = ''; if (selectedElement && selectedElement.classList.contains('workflow-node')) { propertiesPanel.classList.remove('hidden'); const template = nodePropertiesTemplate.content.cloneNode(true); const titleInput = template.getElementById('prop-title'); titleInput.value = selectedElement.querySelector('h3').textContent; titleInput.addEventListener('input', (e) => { selectedElement.querySelector('h3').textContent = e.target.value; }); propertiesContent.appendChild(template); } else { propertiesPanel.classList.add('hidden'); propertiesContent.innerHTML = '<p class="no-selection">Select a node to edit its properties.</p>'; } }
    function updateWorldTransform() { world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`; }
    function screenToWorld(screenX, screenY) { const r = canvas.getBoundingClientRect(); return { x: (screenX - r.left - view.x) / view.scale, y: (screenY - r.top - view.y) / view.scale }; }
    function getPortCenter(port) { const node = port.parentElement; const nodeX = parseFloat(node.style.left); const nodeY = parseFloat(node.style.top); const portX = port.offsetLeft + port.offsetWidth / 2; const portY = port.offsetTop + port.offsetHeight / 2; return { x: nodeX + portX, y: nodeY + portY }; }
    function updateConnectionPath(path, startPort, endPort) { path.setAttribute('marker-end', 'url(#arrowhead)'); const s = getPortCenter(startPort); const e = getPortCenter(endPort); path.setAttribute('d', `M${s.x},${s.y} C${s.x + 50},${s.y} ${e.x - 50},${e.y} ${e.x},${e.y}`); }
    function updateConnectionsForNode(nodeId) { connections.forEach(c => { if (c.from === nodeId || c.to === nodeId) { const p = document.getElementById(c.id); if (p) { const s = document.getElementById(c.from).querySelector('.output'); const e = document.getElementById(c.to).querySelector('.input'); updateConnectionPath(p, s, e); } } }); }

    function loadWorkflow(workflow) {
        // Clear existing workflow
        world.querySelectorAll('.workflow-node').forEach(n => n.remove());
        svgLayer.querySelectorAll('path[id^="conn-"]').forEach(p => p.remove());
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
                const { id, from, to } = connData;
                const fromNode = document.getElementById(from);
                const toNode = document.getElementById(to);
                const startPort = fromNode ? fromNode.querySelector('.output') : null;
                const endPort = toNode ? toNode.querySelector('.input') : null;

                if (startPort && endPort) {
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.id = id;
                    connections.push(connData); // Add to state
                    svgLayer.appendChild(path);
                    updateConnectionPath(path, startPort, endPort);
                    path.addEventListener('click', (e) => {
                        e.stopPropagation();
                        selectElement(path);
                    });
                }
            });
        }
    }
    function exportWorkflow() { const nodes = Array.from(document.querySelectorAll('.workflow-node')).map(n => ({ id: n.id, type: n.classList[1], left: n.style.left, top: n.style.top, title: n.querySelector('h3').textContent })); const workflow = { nodes, connections }; const dataStr = JSON.stringify(workflow, null, 2); const dataBlob = new Blob([dataStr], {type: "application/json"}); const url = URL.createObjectURL(dataBlob); const a = document.createElement('a'); a.href = url; a.download = 'workflow.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); addLogMessage('SUCCESS', 'Workflow exported to workflow.json'); }
    function addLogMessage(level, message) { const e = document.createElement('div'); const t = new Date().toLocaleTimeString(); e.innerHTML = `[${t}] [${level}] ${message}`; logContent.appendChild(e); logContent.scrollTop = logContent.scrollHeight; }
    function simulateExecution() { logContent.innerHTML = ''; addLogMessage('INFO', 'Starting workflow execution simulation...'); const nodes = Array.from(document.querySelectorAll('.workflow-node')); if (nodes.length === 0) { addLogMessage('WARN', 'Workflow is empty. Nothing to execute.'); return; } addLogMessage('INFO', `Publishing workflow with ${nodes.length} nodes and ${connections.length} connections to quanta_synapse...`); let delay = 1000; setTimeout(() => addLogMessage('INFO', 'Received: quanta_porto acknowledged job.'), delay); nodes.forEach(node => { delay += Math.random() * 1000 + 500; setTimeout(() => addLogMessage('INFO', `Executing node: ${node.querySelector('h3').textContent} (${node.id})`), delay); }); delay += 1500; setTimeout(() => addLogMessage('SUCCESS', 'Workflow simulation finished successfully.'), delay); }

    const myNewGraph = {
        nodes: [
            { id: 'new-node-1', type: 'quanta_porto', left: '100px', top: '100px', title: 'My New Node' },
            { id: 'new-node-2', type: 'quanta_synapse', left: '400px', top: '250px', title: 'Another Node' }
        ],
        connections: [
            { id: 'conn-new-node-1-new-node-2', from: 'new-node-1', to: 'new-node-2' }
        ]
    };

    loadWorkflow(myNewGraph);
});

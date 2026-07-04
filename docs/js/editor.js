import { screenToWorld, getBrainSvgHTML, getSorrelRingSvgHTML } from './utils.js';
let loadWorkflow;
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
    // --- State Management ---
    let nodeIdCounter = 0, connections = [], draggedElement = null, selectedElement = null, isDrawingConnection = false, connectionStartPort = null, previewPath = null, isPanning = false, isSpacebarDown = false, panStart = { x: 0, y: 0 }, view = { x: 0, y: 0, scale: 1 }, contextTarget = null;
    /**
     * Persists the current workflow state to browser local storage.
     * RESTRICTION AR-2: This operation must NOT be called within high-frequency
     * event loops (e.g., mousemove, wheel, drag) to ensure UI performance.
     */
    function saveToLocalStorage() {
        const nodes = Array.from(document.querySelectorAll('.workflow-node')).map(n => {
            const htmlNode = n;
            const img = htmlNode.querySelector('img');
            const titleEl = htmlNode.querySelector('h3') || htmlNode.querySelector('.text-content');
            return {
                id: htmlNode.id,
                type: htmlNode.dataset.nodeType || '',
                left: htmlNode.style.left,
                top: htmlNode.style.top,
                width: htmlNode.style.width,
                height: htmlNode.style.height,
                title: titleEl ? titleEl.textContent || '' : '',
                src: img ? img.getAttribute('src') || undefined : undefined
            };
        });
        const workflow = { nodes, connections };
        localStorage.setItem('quantagraph_workflow', JSON.stringify(workflow));
    }
    // --- SVG Setup ---
    const svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgLayer.id = 'svg-layer';
    world.appendChild(svgLayer);
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.id = 'arrowhead';
    marker.setAttribute('viewBox', '-0 -5 10 10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '0');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '8');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 0,-5 L 10 ,0 L 0,5');
    path.setAttribute('fill', '#5a9bd5');
    path.style.stroke = 'none';
    marker.appendChild(path);
    defs.appendChild(marker);
    svgLayer.appendChild(defs);
    // --- Event Listeners ---
    paletteNodes.forEach(node => {
        node.addEventListener('dragstart', handlePaletteDragStart);
        node.addEventListener('mouseenter', showTooltip);
        node.addEventListener('mouseleave', hideTooltip);
        node.addEventListener('mousemove', moveTooltip);
    });
    canvas.addEventListener('dragover', (e) => e.preventDefault());
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
            const target = e.target;
            const file = target.files ? target.files[0] : null;
            if (!file)
                return;
            const reader = new FileReader();
            reader.onload = (event) => {
                var _a;
                try {
                    const content = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                    const workflow = JSON.parse(content);
                    loadWorkflow(workflow);
                    saveToLocalStorage();
                    addLogMessage('SUCCESS', `Workflow imported successfully from ${file.name}`);
                }
                catch (err) {
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
        const target = event.target;
        const nodeType = target.dataset.nodeType;
        if (nodeType) {
            const description = descriptions[nodeType];
            if (description) {
                tooltip.innerHTML = description;
                tooltip.classList.remove('hidden');
                moveTooltip(event);
            }
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
    function handlePaletteDragStart(event) {
        const target = event.target;
        if (event.dataTransfer && target.dataset.nodeType) {
            event.dataTransfer.setData('text/plain', target.dataset.nodeType);
            event.dataTransfer.effectAllowed = 'copy';
        }
    }
    function handleCanvasDrop(event) {
        event.preventDefault();
        const worldPos = screenToWorld(event.clientX, event.clientY, view, canvas.getBoundingClientRect());
        if (draggedElement) {
            // Fix: verify that we are actually in a dragging state
            if (!draggedElement.classList.contains('dragging')) {
                draggedElement = null;
                return;
            }
            const offsetX = parseFloat(draggedElement.dataset.dragOffsetX || '0');
            const offsetY = parseFloat(draggedElement.dataset.dragOffsetY || '0');
            draggedElement.style.left = `${Math.round((worldPos.x - offsetX) / 20) * 20}px`;
            draggedElement.style.top = `${Math.round((worldPos.y - offsetY) / 20) * 20}px`;
            // Use rAF to ensure layout is flushed before recalculating port positions
            const movedId = draggedElement.id;
            requestAnimationFrame(() => {
                updateConnectionsForNode(movedId);
                reconcileDOMWithState();
                saveToLocalStorage();
            });
        }
        else if (event.dataTransfer) {
            const nodeType = event.dataTransfer.getData('text/plain');
            if (nodeType) {
                createNodeOnCanvas({ type: nodeType, worldX: worldPos.x, worldY: worldPos.y, id: undefined, title: '' });
            }
        }
    }
    function handleCanvasDragStart(event) {
        const target = event.target;
        const port = target.closest('.connection-port');
        if (port) {
            event.stopPropagation();
            event.preventDefault();
            return false;
        }
        const node = target.closest('.workflow-node');
        if (node) {
            draggedElement = node;
            const worldPos = screenToWorld(event.clientX, event.clientY, view, canvas.getBoundingClientRect());
            const nodeX = parseFloat(draggedElement.style.left);
            const nodeY = parseFloat(draggedElement.style.top);
            draggedElement.dataset.dragOffsetX = (worldPos.x - nodeX).toString();
            draggedElement.dataset.dragOffsetY = (worldPos.y - nodeY).toString();
            setTimeout(() => { if (draggedElement)
                draggedElement.classList.add('dragging'); }, 0);
        }
        return true;
    }
    function handleCanvasDragEnd() { if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement = null;
    } }
    function handleCanvasMouseDown(event) {
        hideContextMenu();
        const target = event.target;
        const portEl = target.closest('.connection-port');
        if (portEl) {
            event.preventDefault();
            event.stopPropagation();
            if (previewPath)
                previewPath.remove();
            isDrawingConnection = true;
            connectionStartPort = portEl;
            canvas.style.cursor = 'crosshair';
            previewPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            previewPath.setAttribute('stroke-dasharray', '5,5');
            previewPath.setAttribute('marker-end', 'url(#arrowhead)');
            svgLayer.appendChild(previewPath);
        }
        else if (event.buttons === 1 && (isSpacebarDown || !target.closest('.workflow-node'))) {
            isPanning = true;
            panStart.x = event.clientX;
            panStart.y = event.clientY;
            canvas.classList.add('panning');
        }
    }
    function handleCanvasMouseMove(event) {
        const worldPos = screenToWorld(event.clientX, event.clientY, view, canvas.getBoundingClientRect());
        if (isDrawingConnection && connectionStartPort && previewPath) {
            const startPos = getPortCenter(connectionStartPort);
            previewPath.setAttribute('d', `M${startPos.x},${startPos.y} C${startPos.x + 50},${startPos.y} ${worldPos.x - 50},${worldPos.y} ${worldPos.x},${worldPos.y}`);
        }
        else if (isPanning) {
            const dx = event.clientX - panStart.x;
            const dy = event.clientY - panStart.y;
            view.x += dx;
            view.y += dy;
            panStart.x = event.clientX;
            panStart.y = event.clientY;
            updateWorldTransform();
        }
    }
    function handleCanvasMouseLeave() { isPanning = false; canvas.classList.remove('panning'); }
    function handleCanvasMouseUp(event) {
        var _a, _b;
        if (isDrawingConnection && connectionStartPort) {
            const target = event.target;
            const endPort = target.closest('.connection-port');
            if (endPort && ((_a = endPort.parentElement) === null || _a === void 0 ? void 0 : _a.id) !== ((_b = connectionStartPort.parentElement) === null || _b === void 0 ? void 0 : _b.id)) {
                const fromId = connectionStartPort.parentElement.id;
                const toId = endPort.parentElement.id;
                // PR-1: Prevent duplicate connections
                const existing = connections.find(c => c.from === fromId && c.to === toId);
                if (existing) {
                    addLogMessage('WARN', `Connection already exists between ${fromId} and ${toId}`);
                    if (previewPath)
                        previewPath.remove();
                }
                else {
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
            }
            else {
                // PR-2: Ensure previewPath is removed if no connection is formed
                if (previewPath)
                    previewPath.remove();
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
        const target = event.target;
        const clickedNode = target.closest('.workflow-node');
        if (clickedNode) {
            selectElement(clickedNode);
        }
        else if (target.id === 'canvas' || target.id === 'world' || target.id === 'svg-layer') {
            selectElement(null);
        }
    }
    function handleKeyDown(event) { if (event.key === 'Delete' && selectedElement) {
        deleteSelected();
    } if (event.code === 'Space' && !isSpacebarDown) {
        isSpacebarDown = true;
        event.preventDefault();
        canvas.style.cursor = 'grab';
    } }
    function handleKeyUp(event) { if (event.code === 'Space') {
        isSpacebarDown = false;
        canvas.style.cursor = 'default';
    } }
    function handleWheel(event) { event.preventDefault(); const zoomIntensity = 0.1; const mousePos = { x: event.clientX, y: event.clientY }; const worldPosBeforeZoom = screenToWorld(mousePos.x, mousePos.y, view, canvas.getBoundingClientRect()); if (event.deltaY < 0)
        view.scale = Math.min(3, view.scale * (1 + zoomIntensity));
    else
        view.scale = Math.max(0.2, view.scale * (1 - zoomIntensity)); const worldPosAfterZoom = screenToWorld(mousePos.x, mousePos.y, view, canvas.getBoundingClientRect()); view.x += (worldPosAfterZoom.x - worldPosBeforeZoom.x) * view.scale; view.y += (worldPosAfterZoom.y - worldPosBeforeZoom.y) * view.scale; updateWorldTransform(); }
    function handleContextMenu(event) { event.preventDefault(); const target = event.target; const targetNode = target.closest('.workflow-node'); if (targetNode) {
        contextTarget = targetNode;
        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.classList.remove('hidden');
    } }
    function hideContextMenu() { contextMenu.classList.add('hidden'); contextTarget = null; }
    function deleteContextTarget() { if (contextTarget) {
        deleteNode(contextTarget.id);
        saveToLocalStorage();
    } hideContextMenu(); }
    function reconcileDOMWithState() {
        const existingConnIds = new Set(connections.map(c => c.id));
        // Reconcile paths in svgLayer
        const paths = svgLayer.querySelectorAll('path');
        paths.forEach(path => {
            // 1. Keep paths inside <defs> (like arrowhead marker)
            if (path.closest('defs'))
                return;
            // 2. Keep the current active preview path
            if (path === previewPath)
                return;
            // 3. If it's a known connection, keep it
            const id = path.id;
            if (id && id.startsWith('conn-') && existingConnIds.has(id)) {
                return;
            }
            // Otherwise, it's an orphan or leak
            path.remove();
            // Cleanup associated text label if it was a connection path
            if (id && id.startsWith('conn-')) {
                const text = document.getElementById(`text-${id}`);
                if (text)
                    text.remove();
            }
        });
        // Reconcile labels that might not have been caught
        const texts = svgLayer.querySelectorAll('text[id^="text-conn-"]');
        texts.forEach(text => {
            const connId = text.id.replace('text-', '');
            if (!existingConnIds.has(connId)) {
                text.remove();
            }
        });
    }
    function createNodeOnCanvas({ id, type, left, top, worldX, worldY, title, src, width, height }) {
        const newNode = document.createElement('div');
        let isNewNode = false;
        if (id === undefined) {
            isNewNode = true;
            newNode.id = `node-${nodeIdCounter++}`;
            newNode.style.left = `${Math.round(((worldX || 0) - 75) / 20) * 20}px`;
            newNode.style.top = `${Math.round(((worldY || 0) - 25) / 20) * 20}px`;
        }
        else {
            newNode.id = id;
            const numericId = parseInt(id.replace(/[^0-9]/g, ''), 10);
            if (!isNaN(numericId)) {
                nodeIdCounter = Math.max(nodeIdCounter, numericId + 1);
            }
            newNode.style.left = left || '0px';
            newNode.style.top = top || '0px';
        }
        newNode.className = `workflow-node ${type}`;
        if (type === 'text_box') {
            const div = document.createElement('div');
            div.className = 'text-content';
            div.textContent = title || 'Text Box';
            newNode.appendChild(div);
        }
        else if (type === 'logo' || type === 'background') {
            const img = document.createElement('img');
            img.src = src || '';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.pointerEvents = 'none';
            img.style.display = 'block';
            newNode.appendChild(img);
            if (!width)
                newNode.style.width = '100px';
            if (!height)
                newNode.style.height = '100px';
        }
        else if (type === 'brain_connectome') {
            newNode.innerHTML = getBrainSvgHTML();
            if (!width)
                newNode.style.width = '920px';
            if (!height)
                newNode.style.height = '350px';
        }
        else if (type === 'sorrel_ring') {
            newNode.innerHTML = getSorrelRingSvgHTML();
            if (!width)
                newNode.style.width = '400px';
            if (!height)
                newNode.style.height = '400px';
        }
        else {
            const h3 = document.createElement('h3');
            h3.textContent = title || type;
            newNode.appendChild(h3);
        }
        if (width)
            newNode.style.width = width;
        if (height)
            newNode.style.height = height;
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
    function selectElement(element) { if (selectedElement)
        selectedElement.classList.remove('selected'); selectedElement = element; if (selectedElement) {
        selectedElement.classList.add('selected');
    } updatePropertiesPanel(); }
    function deleteNode(nodeId) { const node = document.getElementById(nodeId); if (node)
        node.remove(); const conns = connections.filter(c => c.from === nodeId || c.to === nodeId); conns.forEach(c => deleteConnection(c.id)); }
    function deleteConnection(connId) {
        const connEl = document.getElementById(connId);
        if (connEl)
            connEl.remove();
        const textEl = document.getElementById(`text-${connId}`);
        if (textEl)
            textEl.remove();
        connections = connections.filter(c => c.id !== connId);
        saveToLocalStorage();
    }
    function deleteSelected() { if (selectedElement) {
        if (selectedElement instanceof SVGPathElement) {
            deleteConnection(selectedElement.id);
        }
        else if (selectedElement instanceof HTMLElement && selectedElement.classList.contains('workflow-node')) {
            deleteNode(selectedElement.id);
        }
        selectElement(null);
        saveToLocalStorage();
    } }
    function updatePropertiesPanel() {
        var _a;
        propertiesContent.innerHTML = '';
        if (selectedElement) {
            propertiesPanel.classList.remove('hidden');
            if (selectedElement instanceof HTMLElement && selectedElement.classList.contains('workflow-node')) {
                const nodeType = selectedElement.dataset.nodeType || '';
                const template = nodePropertiesTemplate.content.cloneNode(true);
                const titleInput = template.getElementById('prop-title');
                const titleElement = selectedElement.querySelector('h3') || selectedElement.querySelector('.text-content');
                titleInput.value = titleElement ? titleElement.textContent || '' : '';
                titleInput.addEventListener('change', (e) => {
                    const target = e.target;
                    if (titleElement)
                        titleElement.textContent = target.value;
                    saveToLocalStorage();
                });
                propertiesContent.appendChild(template);
                if (nodeType === 'logo' || nodeType === 'background') {
                    const srcDiv = document.createElement('div');
                    srcDiv.className = 'property';
                    const img = selectedElement.querySelector('img');
                    srcDiv.innerHTML = `<label>Image Source</label><input type="text" class="property-input" value="${img ? img.getAttribute('src') || '' : ''}">`;
                    (_a = srcDiv.querySelector('input')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', (e) => {
                        const target = e.target;
                        if (img)
                            img.setAttribute('src', target.value);
                        saveToLocalStorage();
                    });
                    propertiesContent.appendChild(srcDiv);
                }
                ['width', 'height'].forEach(prop => {
                    var _a;
                    const div = document.createElement('div');
                    div.className = 'property';
                    div.innerHTML = `<label>${prop.charAt(0).toUpperCase() + prop.slice(1)}</label><input type="text" class="property-input" value="${selectedElement.style[prop] || ''}">`;
                    (_a = div.querySelector('input')) === null || _a === void 0 ? void 0 : _a.addEventListener('change', (e) => {
                        const target = e.target;
                        selectedElement.style[prop] = target.value;
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
            }
            else if (selectedElement instanceof SVGPathElement) {
                const conn = connections.find(c => c.id === selectedElement.id);
                if (conn) {
                    const template = document.getElementById('edge-properties-template').content.cloneNode(true);
                    const typeSelect = template.getElementById('prop-edge-type');
                    typeSelect.value = conn.type;
                    typeSelect.addEventListener('change', (e) => {
                        const target = e.target;
                        conn.type = target.value;
                        const startNode = document.getElementById(conn.from);
                        const endNode = document.getElementById(conn.to);
                        const startPort = startNode ? startNode.querySelector('.output') : null;
                        const endPort = endNode ? endNode.querySelector('.input') : null;
                        if (startPort && endPort && selectedElement instanceof SVGPathElement) {
                            updateConnectionPath(selectedElement, startPort, endPort, conn.type);
                            saveToLocalStorage();
                        }
                    });
                    propertiesContent.appendChild(template);
                }
            }
        }
        else {
            propertiesPanel.classList.add('hidden');
            propertiesContent.innerHTML = '<p class="no-selection">Select a node or edge to edit its properties.</p>';
        }
    }
    function updateWorldTransform() { world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`; }
    function getPortCenter(port) {
        // Use getBoundingClientRect so CSS transforms (translateY(-50%) etc.) are accounted for
        const rect = port.getBoundingClientRect();
        return screenToWorld(rect.left + rect.width / 2, rect.top + rect.height / 2, view, canvas.getBoundingClientRect());
    }
    function updateConnectionPath(path, startPort, endPort, type) {
        path.setAttribute('marker-end', 'url(#arrowhead)');
        path.setAttribute('class', `connection-${type}`);
        const s = getPortCenter(startPort);
        const e = getPortCenter(endPort);
        path.setAttribute('d', `M${s.x},${s.y} C${s.x + 50},${s.y} ${e.x - 50},${e.y} ${e.x},${e.y}`);
        let text = document.getElementById(`text-${path.id}`);
        if (!text) {
            const svgNS = 'http://www.w3.org/2000/svg';
            text = document.createElementNS(svgNS, 'text');
            text.id = `text-${path.id}`;
            const textPath = document.createElementNS(svgNS, 'textPath');
            textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${path.id}`);
            textPath.setAttribute('startOffset', '50%');
            textPath.textContent = type.replace('_', ' ');
            text.appendChild(textPath);
            svgLayer.appendChild(text);
        }
        else {
            const textPath = text.querySelector('textPath');
            if (textPath instanceof SVGTextPathElement)
                textPath.textContent = type.replace('_', ' ');
        }
    }
    function updateConnectionsForNode(nodeId) {
        connections.forEach(c => {
            if (c.from === nodeId || c.to === nodeId) {
                const p = document.getElementById(c.id);
                if (p) {
                    const startNode = document.getElementById(c.from);
                    const endNode = document.getElementById(c.to);
                    const s = startNode ? startNode.querySelector('.output') : null;
                    const e = endNode ? endNode.querySelector('.input') : null;
                    if (s && e) {
                        updateConnectionPath(p, s, e, c.type);
                    }
                }
            }
        });
    }
    loadWorkflow = (workflow) => {
        // Clear existing workflow
        world.querySelectorAll('.workflow-node').forEach(n => n.remove());
        Array.from(svgLayer.children).forEach(child => {
            if (child.tagName !== 'defs')
                child.remove();
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
    };
    window.loadWorkflow = loadWorkflow;
    function exportWorkflow() {
        const nodes = Array.from(document.querySelectorAll('.workflow-node')).map(n => {
            const htmlNode = n;
            const img = htmlNode.querySelector('img');
            const titleEl = htmlNode.querySelector('h3') || htmlNode.querySelector('.text-content');
            return {
                id: htmlNode.id,
                type: htmlNode.dataset.nodeType || '',
                left: htmlNode.style.left,
                top: htmlNode.style.top,
                width: htmlNode.style.width,
                height: htmlNode.style.height,
                title: titleEl ? titleEl.textContent || '' : '',
                src: img ? img.getAttribute('src') || undefined : undefined
            };
        });
        const workflow = { nodes, connections };
        const dataStr = JSON.stringify(workflow, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
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
    function addLogMessage(level, message) {
        const e = document.createElement('div');
        const t = new Date().toLocaleTimeString();
        e.textContent = `[${t}] [${level}] ${message}`;
        logContent.appendChild(e);
        logContent.scrollTop = logContent.scrollHeight;
    }
    function simulateExecution() {
        logContent.innerHTML = '';
        addLogMessage('INFO', 'Starting workflow execution simulation...');
        const nodes = Array.from(document.querySelectorAll('.workflow-node'));
        if (nodes.length === 0) {
            addLogMessage('WARN', 'Workflow is empty. Nothing to execute.');
            return;
        }
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
            { id: 'node-ring', type: 'sorrel_ring', left: '495px', top: '150px', width: '400px', height: '400px', title: 'Sorrel Ring' },
            { id: 'node-brain', type: 'brain_connectome', left: '120px', top: '610px', width: '920px', height: '350px', title: 'Brain Connectome' },
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
        }
        catch (e) {
            console.error('Error loading saved workflow:', e);
            loadWorkflow(demoWorkflow);
        }
    }
    else {
        loadWorkflow(demoWorkflow);
    }
});

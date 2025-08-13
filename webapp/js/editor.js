document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const canvas = document.getElementById('canvas');
    const paletteNodes = document.querySelectorAll('.palette-node');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const executeBtn = document.getElementById('execute-btn');
    const propertiesPanel = document.getElementById('properties-panel');
    const propertiesContent = document.getElementById('properties-content');
    const nodePropertiesTemplate = document.getElementById('node-properties-template');
    const logContent = document.getElementById('log-content');
    const clearLogBtn = document.getElementById('clear-log-btn');

    // --- State Management ---
    let nodeIdCounter = 0, connections = [], draggedElement = null, selectedElement = null;
    let offsetX, offsetY, isDrawingConnection = false, connectionStartPort = null, previewPath = null;

    // --- SVG Setup ---
    const svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgLayer.id = 'svg-layer';
    canvas.appendChild(svgLayer);

    // --- Event Listeners ---
    paletteNodes.forEach(node => node.addEventListener('dragstart', handlePaletteDragStart));
    canvas.addEventListener('dragover', e => e.preventDefault());
    canvas.addEventListener('drop', handleCanvasDrop);
    canvas.addEventListener('dragstart', handleCanvasDragStart);
    canvas.addEventListener('dragend', handleCanvasDragEnd);
    canvas.addEventListener('mousedown', handleCanvasMouseDown);
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    canvas.addEventListener('mouseup', handleCanvasMouseUp);
    canvas.addEventListener('click', handleCanvasClick);
    window.addEventListener('keydown', handleKeyDown);
    exportBtn.addEventListener('click', exportWorkflow);
    importBtn.addEventListener('click', () => addLogMessage('INFO', 'Import functionality not yet implemented.'));
    executeBtn.addEventListener('click', simulateExecution);
    clearLogBtn.addEventListener('click', () => { logContent.innerHTML = ''; });

    // --- Event Handlers ---
    function handlePaletteDragStart(event) { event.dataTransfer.setData('text/plain', event.target.dataset.nodeType); event.dataTransfer.effectAllowed = 'copy'; }
    function handleCanvasDrop(event) {
        event.preventDefault();
        if (draggedElement) {
            const r = canvas.getBoundingClientRect();
            let x = event.clientX - r.left - offsetX + canvas.scrollLeft;
            let y = event.clientY - r.top - offsetY + canvas.scrollTop;
            draggedElement.style.left = `${Math.round(x / 20) * 20}px`;
            draggedElement.style.top = `${Math.round(y / 20) * 20}px`;
            updateConnectionsForNode(draggedElement.id);
        } else {
            const nodeType = event.dataTransfer.getData('text/plain');
            if (nodeType) createNodeOnCanvas({ type: nodeType, clientX: event.clientX, clientY: event.clientY });
        }
    }
    function handleCanvasDragStart(event) { if (event.target.classList.contains('workflow-node')) { draggedElement = event.target; offsetX = event.offsetX; offsetY = event.offsetY; setTimeout(() => draggedElement.classList.add('dragging'), 0); } }
    function handleCanvasDragEnd() { if (draggedElement) { draggedElement.classList.remove('dragging'); draggedElement = null; } }
    function handleCanvasMouseDown(event) { if (event.target.classList.contains('connection-port')) { isDrawingConnection = true; connectionStartPort = event.target; canvas.style.cursor = 'crosshair'; previewPath = document.createElementNS('http://www.w3.org/2000/svg', 'path'); previewPath.setAttribute('stroke-dasharray', '5,5'); svgLayer.appendChild(previewPath); } }
    function handleCanvasMouseMove(event) { if (isDrawingConnection) { const r = canvas.getBoundingClientRect(); const s = getPortCenter(connectionStartPort); const e = { x: event.clientX - r.left + canvas.scrollLeft, y: event.clientY - r.top + canvas.scrollTop }; previewPath.setAttribute('d', `M${s.x},${s.y} C${s.x + 50},${s.y} ${e.x - 50},${e.y} ${e.x},${e.y}`); } }
    function handleCanvasMouseUp(event) {
        if (isDrawingConnection) {
            const endPort = event.target;
            if (endPort.classList.contains('connection-port') && endPort.parentElement.id !== connectionStartPort.parentElement.id) {
                const conn = { id: `conn-${connectionStartPort.parentElement.id}-${endPort.parentElement.id}`, from: connectionStartPort.parentElement.id, to: endPort.parentElement.id };
                connections.push(conn);
                const path = previewPath; path.id = conn.id; path.removeAttribute('stroke-dasharray');
                updateConnectionPath(path, connectionStartPort, endPort);
                path.addEventListener('click', (e) => { e.stopPropagation(); selectElement(path); });
            } else { previewPath.remove(); }
            isDrawingConnection = false; previewPath = null; canvas.style.cursor = 'default';
        }
    }
    function handleCanvasClick(event) { if (event.target.classList.contains('workflow-node')) selectElement(event.target); else if (event.target.id === 'canvas' || event.target.id === 'svg-layer') selectElement(null); }
    function handleKeyDown(event) { if (event.key === 'Delete' && selectedElement) { if (selectedElement.tagName === 'path') deleteConnection(selectedElement.id); else if (selectedElement.classList.contains('workflow-node')) deleteNode(selectedElement.id); selectElement(null); } }

    // --- Core Logic ---
    function createNodeOnCanvas({id, type, left, top, clientX, clientY, title}) {
        const newNode = document.createElement('div');
        if (id === undefined) {
            const r = canvas.getBoundingClientRect();
            let x = clientX - r.left + canvas.scrollLeft - 75;
            let y = clientY - r.top + canvas.scrollTop - 25;
            newNode.id = `node-${nodeIdCounter++}`;
            newNode.style.left = `${Math.round(x / 20) * 20}px`;
            newNode.style.top = `${Math.round(y / 20) * 20}px`;
        } else {
            newNode.id = id;
            nodeIdCounter = Math.max(nodeIdCounter, parseInt(id.split('-')[1]) + 1);
            newNode.style.left = left;
            newNode.style.top = top;
        }
        newNode.className = `workflow-node ${type}`;
        newNode.innerHTML = `<h3>${title || type.charAt(0).toUpperCase() + type.slice(1)} Node</h3>`;
        newNode.setAttribute('draggable', 'true');
        ['input', 'output'].forEach(portType => { const port = document.createElement('div'); port.className = `connection-port ${portType}`; newNode.appendChild(port); });
        canvas.appendChild(newNode);
    }
    function selectElement(element) { if (selectedElement) selectedElement.classList.remove('selected'); selectedElement = element; if (selectedElement) { selectedElement.classList.add('selected'); } updatePropertiesPanel(); }
    function deleteNode(nodeId) { const node = document.getElementById(nodeId); if (node) node.remove(); const conns = connections.filter(c => c.from === nodeId || c.to === nodeId); conns.forEach(c => deleteConnection(c.id)); }
    function deleteConnection(connId) { const connEl = document.getElementById(connId); if (connEl) connEl.remove(); connections = connections.filter(c => c.id !== connId); }
    function updatePropertiesPanel() {
        propertiesContent.innerHTML = '';
        if (selectedElement && selectedElement.classList.contains('workflow-node')) {
            propertiesPanel.classList.remove('hidden');
            const template = nodePropertiesTemplate.content.cloneNode(true);
            const titleInput = template.getElementById('prop-title');
            titleInput.value = selectedElement.querySelector('h3').textContent;
            titleInput.addEventListener('input', (e) => { selectedElement.querySelector('h3').textContent = e.target.value; });
            propertiesContent.appendChild(template);
        } else {
            propertiesPanel.classList.add('hidden');
            propertiesContent.innerHTML = '<p class="no-selection">Select a node to edit its properties.</p>';
        }
    }

    // --- Utility & Simulation ---
    function getPortCenter(port) { const r = port.getBoundingClientRect(); const c = canvas.getBoundingClientRect(); return { x: r.left - c.left + (r.width / 2) + canvas.scrollLeft, y: r.top - c.top + (r.height / 2) + canvas.scrollTop }; }
    function updateConnectionPath(path, startPort, endPort) { const s = getPortCenter(startPort); const e = getPortCenter(endPort); path.setAttribute('d', `M${s.x},${s.y} C${s.x + 50},${s.y} ${e.x - 50},${e.y} ${e.x},${e.y}`); }
    function updateConnectionsForNode(nodeId) { connections.forEach(c => { if (c.from === nodeId || c.to === nodeId) { const p = document.getElementById(c.id); if (p) { const s = document.getElementById(c.from).querySelector('.output'); const e = document.getElementById(c.to).querySelector('.input'); updateConnectionPath(p, s, e); } } }); }
    function exportWorkflow() {
        const nodes = Array.from(document.querySelectorAll('.workflow-node')).map(n => ({ id: n.id, type: n.classList[1], left: n.style.left, top: n.style.top, title: n.querySelector('h3').textContent }));
        const workflow = { nodes, connections };
        const dataStr = JSON.stringify(workflow, null, 2);
        const dataBlob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a'); a.href = url; a.download = 'workflow.json';
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        addLogMessage('SUCCESS', 'Workflow exported to workflow.json');
    }
    function addLogMessage(level, message) {
        const logEntry = document.createElement('div');
        const timestamp = new Date().toLocaleTimeString();
        logEntry.innerHTML = `[${timestamp}] [${level}] ${message}`;
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight; // Auto-scroll to bottom
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
            setTimeout(() => addLogMessage('INFO', `Executing node: ${node.querySelector('h3').textContent} (${node.id})`), delay);
        });

        delay += 1500;
        setTimeout(() => addLogMessage('SUCCESS', 'Workflow simulation finished successfully.'), delay);
    }
});

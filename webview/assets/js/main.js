/*
MIT License

Copyright (c) 2026 Max Kas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// @ts-nocheck
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

var orientationLayouts = new Set([
    "list", "array"
]);
var nodesLayouts = new Set([
    "graph", "tree", "linkedlist"
]);
var arrayLayouts = new Set([
    "array"
]);
var array2DLayouts = new Set([
    "array2D"
]);
var array3DLayouts = new Set([
    "array3D"
]);
var barsLayouts = new Set([
    "bars"
]);
var plotLayouts = new Set([
    "plotpoints", "plotlines"
]);

const BARS_ROWS = 10;
var nodeColor = '#ccd4f3';
var varNodeColor = '#e8ccf0';
var vscode;
var network;
var layout;
var options;
var updateOptions;
var selectedObject, selectedObjectType;
var panelState = {
    nodePositions: {},
    networkData: {
        nodes: {},
        edges: {},
    },
    paramsData: undefined,
    settings: {
        delay: 1000,
        physics: false,
        smoothEdges: false,
    },
    source: {
        lines: [],
        start: 0,
        end: 0
    },
    selectedLayout: {}
};

function init() {
    this.container = document.getElementById("graph");
    this.nodeLayout = document.getElementById("layout");
    this.orientationSelect = document.getElementById("orientation");
    this.physicsSelect = document.getElementById("physics");
    this.smoothEdges = document.getElementById("smooth-edges");
    this.sourceLines = document.getElementById("source");
    this.backBtn = document.getElementById("back");
    this.contBtn = document.getElementById("cont");
    this.nextBtn = document.getElementById("next");
    this.runBtn = document.getElementById("run");
    this.pauseBtn = document.getElementById("pause");
    this.addBtn = document.getElementById("add-variable");
    this.refreshBtn = document.getElementById("refresh");
    this.delay = document.getElementById("delay");
    this.varsOptions = document.getElementById("vars-options");
    this.layoutSelect = document.getElementById("layout");
    this.nodesSelect = document.getElementById("nodes");
    this.edgesSelect = document.getElementById("edges");
    this.propertiesSelect = document.getElementById("properties");
    this.markers = document.getElementById("markers-input");
    this.markersOptions = document.getElementById("markers-options");
    this.removeNodes = document.getElementById("remove-nodes");
    this.removeEdges = document.getElementById("remove-edges");
    this.removeProperties = document.getElementById("remove-properties");
    this.removeMarkers = document.getElementById("remove-markers");
    this.elementName = document.getElementById("object-name");
    this.elementType = document.getElementById("object-type");
    this.progressBar = document.getElementById("progress-bar");
    this.saveName = document.getElementById("save-name");
    this.saveType = document.getElementById("save-type");
}

function saveState() {
    console.log("save state: ", panelState);
    vscode.setState({ panelState: panelState });
}

function loadState() {
    let oldState = vscode.getState();
    if (oldState && oldState.panelState) {
        panelState = oldState.panelState;
        console.log("loaded state: ", panelState);
    }
}

(function () {
    if (typeof (acquireVsCodeApi) === 'function') {
        vscode = acquireVsCodeApi();
        loadState();
    } else {
        window.varOptionsUrl = "var-options.html";
    }
    setupListeners();
}());

function setupListeners() {
    window.addEventListener("load", event => {
        init();
        setupVarOptions(varsOptions.children[0]);
        setupVariableListeners();
        window.addEventListener('message', event => {
            const message = event.data; // The json data that the extension sent
            if (!message)
                return;
            switch (message.command) {
                case 'createGraph':
                    createGraph(message.data, message.source, message.selectedLayout);
                    break;
                case 'updateGraph':
                    updateGraph(message.data, message.source, message.selectedLayout);
                    break;
                case 'updateVarOptions':
                    updateVarOptions(message);
                    break;
                case 'updateParams':
                    updateParams(message);
                    break;
                case 'enableVarsOptions':
                    enableVarsOptions(message.value);
                    break;
                case 'showProgress':
                    showProgress(message.value);
                    break;
            }
        });

        setupControlListeners();
        requestCommand('update');
    });
}

function setupControlListeners() {

    backBtn.addEventListener('click', event => {
        requestCommand('back');
    });

    contBtn.addEventListener('click', event => {
        requestCommand('cont');
    });

    nextBtn.addEventListener('click', event => {
        requestCommand('next');
    });

    runBtn.addEventListener('click', event => {
        requestCommand('run');
    });

    pauseBtn.addEventListener('click', event => {
        requestCommand('pause');
    });

    addBtn.addEventListener('click', event => {
        addVarOptions();
    });

    refreshBtn.addEventListener('click', event => {
        requestCommand('refresh');
    });

    delay.value = panelState.settings.delay;
    delay.addEventListener("change", (e) => {
        panelState.settings.delay = delay.value;
        saveState();
        sendOptionChanged('delay', '', [delay.value]);
    });

    physics.checked = panelState.settings.physics;
    physics.addEventListener("change", (e) => {
        panelState.settings.physics = physics.checked;
        saveState();
        requestCommand('refresh');
    });

    smoothEdges.checked = panelState.settings.smoothEdges;
    smoothEdges.addEventListener("change", (e) => {
        panelState.settings.smoothEdges = smoothEdges.checked;
        saveState();
        requestCommand('refresh');
    });
}

function setupVariableListeners() {
    layoutSelect.addEventListener("click", (e) => {
        orientationSelect.visibility = orientationLayouts.has(layoutSelect.value) ? "visible" : "collapse";
        nodesSelect.visibility = nodesLayouts.has(layoutSelect.value) ? "visible" : "collapse";
        edgesSelect.visibility = nodesLayouts.has(layoutSelect.value) ? "visible" : "collapse";
        propertiesSelect.visibility = nodesLayouts.has(layoutSelect.value) ? "visible" : "collapse";
        markers.visibility = arrayLayouts.has(layoutSelect.value) ? "visible" : "collapse";
    });

    markersOptions.addEventListener("change", (e) => {
        markers.value = markersOptions.value;
        sendOptionChanged('selectedMarkers', selectedObjectType,
            markers.value.split(","));
    });

    markersOptions.addEventListener("change", (e) => {
        markers.value = markersOptions.value;
    });

    removeNodes.addEventListener("click", (e) => {
        nodesSelect.selectedIndex = -1;
    });

    removeEdges.addEventListener("click", (e) => {
        edgesSelect.selectedIndex = -1;
    });

    removeProperties.addEventListener("click", (e) => {
        propertiesSelect.selectedIndex = -1;
    });

    removeMarkers.addEventListener("click", (e) => {
        markers.value = "";
    });

    saveName.addEventListener("click", (e) => {
        saveOptions("id:" + selectedObject);
    });

    saveType.addEventListener("click", (e) => {
        saveOptions("type:" + selectedObjectType);
    });
}

function saveOptions(source) {
    sendOptionChanged('selectedLayout', source, [layoutSelect.value]);
    sendOptionChanged('selectedOrientation', source, [orientationSelect.value]);
    sendOptionChanged('selectedNodes', source,
        Array.from(nodesSelect.selectedOptions).map((x) => x.value));
    sendOptionChanged('selectedEdges', source,
        Array.from(edgesSelect.selectedOptions).map((x) => x.value));
    sendOptionChanged('selectedProperties', source,
        Array.from(propertiesSelect.selectedOptions).map((x) => x.value));
    sendOptionChanged('selectedMarkers', source,
        [markers.value]);
    requestCommand('refresh');
}

function showProgress(value) {
    progressBar.style.visibility = value ? "visible" : "hidden";
    console.log("prog: " + progressBar.style.visibility);
}

function enableVarsOptions(value) {
    for (const varOption of varsOptions.getElementsByTagName("select")) {
        varOption.disabled = !value;
    }
}

function addVarOptions() {
    let firstVarOptions = varsOptions.children[0];
    let newVarOptions = firstVarOptions.cloneNode(true);
    varsOptions.appendChild(newVarOptions);
    setupVarOptions(newVarOptions);
}

function setupVarOptions(varOptions) {

    let variable = varOptions.getElementsByClassName("variable")[0];
    for (const child of variable.children) {
        if (hasValue(variable, child.value))
            continue;
        var option = document.createElement('option');
        option.value = child.value;
        variable.appendChild(option);
    }
    let variableInput = varOptions.getElementsByClassName("variable-input")[0];
    variableInput.value = "";

    let removeVariable = varOptions.getElementsByClassName("remove-variable")[0];

    // variable listeners
    variableInput.addEventListener("change", (e) => {
        sendOptionChanged('selectedVariables', '',
            Array.from(varsOptions.getElementsByClassName("variable-input")).map((x) => x.value));
    });
    variable.addEventListener("change", (e) => {
        variableInput.value = variable.value;
        sendOptionChanged('selectedVariables', '',
            Array.from(varsOptions.getElementsByClassName("variable-input")).map((x) => x.value));
    });

    removeVariable.onclick = (e) => {
        if (varsOptions.children.length > 1) {
            varsOptions.removeChild(varOptions);
            sendOptionChanged('selectedVariables', '',
                Array.from(varsOptions.getElementsByClassName("variable-input")).map((x) => x.value));
        } else {
            variableInput.value = "";
        }
    }
}

function updateVarOptions(data) {
    if (!data)
        return;

    selectedObject = data.selectedObject;
    selectedObjectType = data.selectedObjectType;

    elementName.innerHTML = data.selectedObject;
    elementType.innerHTML = data.selectedObjectType;

    nodesSelect.innerHTML = "";
    let selectedOption;
    for (let node of data.nodes) {
        var option = document.createElement('option');
        option.value = node;
        option.innerHTML = node;
        if (data.selectedNodes.includes(node))
            selectedOption = option;
        nodesSelect.appendChild(option);
    }
    if (selectedOption)
        selectedOption.selected = true;
    else
        nodesSelect.selectedIndex = -1;

    edgesSelect.innerHTML = "";
    selectedOption = undefined;
    for (let property of data.edges) {
        var option = document.createElement('option');
        option.value = property;
        option.innerHTML = property;
        if (data.selectedEdges.includes(property))
            selectedOption = option;
        edgesSelect.appendChild(option);
    }
    if (selectedOption)
        selectedOption.selected = true;
    else
        edgesSelect.selectedIndex = -1;

    properties.innerHTML = "";
    for (let property of data.properties) {
        var option = document.createElement('option');
        option.value = property;
        option.innerHTML = property;
        if (data.selectedProperties.includes(property))
            option.selected = true;
        propertiesSelect.appendChild(option);
    }

    layoutSelect.value = data.selectedLayout;
    orientationSelect.value = data.selectedOrientation;
    markers.value = data.selectedMarkers;

    panelState.paramsData = data;
    saveState();
}

function updateParams(data) {
    panelState.paramsData = data;
    saveState();

    for (let varOptions of varsOptions.children) {
        let variable = varOptions.getElementsByClassName("variable")[0];
        let selectedIndex = variable.selectedIndex;
        for (let variableName of data.variables) {
            if (hasValue(variable, variableName)) {
                continue;
            }
            var option = document.createElement('option');
            option.value = variableName;
            option.innerText = variableName;
            variable.appendChild(option);
        }
        variable.selectedIndex = selectedIndex;
    }

    for (let variableName of data.variables) {
        if (hasValue(markersOptions, variableName)) {
            continue;
        }
        var option = document.createElement('option');
        option.value = variableName;
        option.innerText = variableName;
        markersOptions.appendChild(option);
    }
}

function hasValue(element, value) {
    for (const option of element.children) {
        if (option.value === value) {
            return true;
        }
    }
    return false;
}

function createGraph(data, source, selectedLayout) {
    if (!data)
        return;
    updateNodes(data.nodes);
    updateEdges(data.edges);
    updateSourceLines(source);
    createNetworkOptions(selectedLayout);
    createNetwork(data);
    saveNetwork(data, source, selectedLayout);
    setupNetworkListeners(selectedLayout);
}

function updateGraph(data, source, selectedLayout) {
    if (!data)
        return;
    updateNodes(data.newNodes);
    updateNodes(data.updateNodes);
    updateEdges(network.newEdges);
    updateEdges(network.updateEdges);
    updateSourceLines(source);
    updateNetworkOptions(selectedLayout);
    network.once('afterDrawing', (ctx) => {
        saveNodePositions(network);
        requestCommand('updated');
    });
    updateNetwork(data);
    saveNetwork(data, source, selectedLayout);

}

function updateNodes(nodeObjects) {
    if (!nodeObjects)
        return;
    for (const node of nodeObjects) {
        if (node.id in panelState.nodePositions) {
            let position = panelState.nodePositions[node.id];
            node.x = position.x;
            node.y = position.y;
        }
    }
}

function updateEdges(edgeObjects) {
    if (!edgeObjects)
        return;
    if (smoothEdges.checked) {
        for (const edge of edgeObjects) {
            if (!edge.smooth) {
                edge.smooth = true;
            }
        }
    }
}

function createNetwork(data) {
    nodes = new vis.DataSet(data.nodes);
    edges = new vis.DataSet(data.edges);
    var visData = {
        nodes: nodes,
        edges: edges,
    };
    network = new vis.Network(container, visData, options);
}

function updateNetwork(data) {
    for (const node of data.newNodes) {
        if (!nodes.get(node.id)) {
            nodes.add(node);
        } else {
            nodes.update(node);
        }
    }
    for (const node of data.removeNodes) {
        if (nodes.get(node.id)) {
            nodes.remove(node);
        }
    }
    for (const node of data.updateNodes) {
        if (nodes.get(node.id)) {
            nodes.update(node);
        }
    }
    for (const edge of data.newEdges) {
        if (!edges.get(edge.id)) {
            edges.add(edge);
        } else {
            edges.update(edge);
        }
    }
    for (const edge of data.removeEdges) {
        if (edges.get(edge.id)) {
            edges.remove(edge);
        }
    }
    for (const edge of data.updateEdges) {
        if (edges.get(edge.id)) {
            edges.update(edge);
        }
    }

    for (const [edgeId, edge] of Object.entries(panelState.networkData.edges)) {
        if (typeof (edge.smooth) !== 'object') {
            if (smoothEdges.checked) {
                edge.smooth = true;
            } else {
                edge.smooth = false;
            }
            if (edges.get(edge.id))
                edges.update(edge);
        }
    }
}

function setupNetworkListeners(selectedLayout) {
    network.on('dragEnd', function (e) {
        // store new position
        console.log(e);
        for (const nodeId of e.nodes) {
            let newPosition = network.getPositions()[nodeId];
            let node = panelState.nodePositions[nodeId];
            if (node) {
                node.x = newPosition.x;
                node.y = newPosition.y;
            }
        }
        panelState.position = network.getViewPosition();
        panelState.scale = network.getScale();
        onSelectedNode(e);
        setTimeout(() => {
            saveNodePositions(network);
            saveState();
        });
    });

    network.on('dragStart', function (e) {
        onSelectedNode(e);
    });

    network.once('beforeDrawing', (ctx) => {
        container.style.visibility = 'hidden';
        setTimeout(() => {
            restoreViewPosition(network);
            container.style.visibility = 'visible';
        });
    });

    network.once('afterDrawing', (ctx) => {
        // fit to window
        container.style.height = '100vh';

        // save node positions
        saveNodePositions(network);
        requestCommand('updated');
    });

    network.on('stabilized', (ctx) => {
        saveNodePositions(network);
    });

    network.on('afterDrawing', (ctx) => {
        formatLabels(ctx, "labelMarkers", '#035bff');
        formatLabels(ctx, "labelDiffs", '#e93b1c');
        formatBarsLayout(ctx, selectedLayout);
        formatPlotLayout(ctx, selectedLayout);
    });

    network.on("zoom", (ctx) => {
        panelState.scale = network.getScale();
        panelState.position = network.getViewPosition();
        saveState();
    });

    network.on('selectNode', function (e) {
        onSelectedNode(e);
    });
}

function formatLabels(ctx, diffType, color) {
    const height = parseInt(ctx.font.split(" ")[0]);
    const vertMargin = 7;
    ctx.textAlign = 'center';

    for (const [nodeId, node] of Object.entries(panelState.networkData.nodes)) {
        let diffs;
        if (diffType === "labelDiffs")
            diffs = node.labelDiff;
        else if (diffType === "labelMarkers")
            diffs = node.labelMarkers;

        if (!diffs || diffs.length == 0) {
            continue;
        }
        let position;

        try {
            position = network.getPosition(node.id);
        } catch (ex) {
            console.error(ex);
            continue;
        }
        const lines = node.label.split("\n");
        const totalHeight = height * lines.length;

        let lineNum = 0;
        let chars = 0;
        let idx = 0;

        for (const line of lines) {
            let hasDiff = false;
            while (idx < diffs.length && diffs[idx].start < chars - 1) {
                idx++;
            }
            let newLine = "";
            while (idx < diffs.length && diffs[idx].start < chars + line.length) {
                let start = diffs[idx].start - chars;
                let end = diffs[idx].end - chars;
                const diffText = line.substring(start, end);
                newLine += ''.padStart(start - newLine.length, ' ');
                newLine += diffText;
                hasDiff = true;
                idx++;
            }
            if (hasDiff) {
                newLine = newLine.padEnd(line.length, ' ');
                let coverLine = "";
                for (let ch of newLine) {
                    coverLine += (ch != ' ' ? '\u2588' : ' ');
                }
                ctx.fillStyle = node.group === 'Node' ? nodeColor : varNodeColor;
                ctx.fillText(coverLine,
                    position.x,
                    position.y + (lineNum) * height - totalHeight / 2 + vertMargin);
                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                ctx.fillText(newLine,
                    position.x,
                    position.y + (lineNum) * height - totalHeight / 2 + vertMargin);
            }
            lineNum++;
            chars += line.length + 1;
        }
    }
}

function formatBarsLayout(ctx, selectedLayout) {
    let height = 0;
    for (const part of ctx.font.split(" ")) {
        const fontHeight = parseInt(part);
        if (!isNaN(fontHeight)) {
            height = fontHeight;
            break;
        }
    }
    const vertMargin = 7;
    ctx.textAlign = 'center';

    for (const [nodeId, node] of Object.entries(panelState.networkData.nodes)) {
        if (node.bars.length == 0) {
            continue;
        }
        console.log("format bars", node.id);
        let position;
        try {
            position = network.getPosition(node.id);
        } catch (ex) {
            console.error(ex);
            continue;
        }
        const lines = node.label.split("\n");
        const totalHeight = height * lines.length;

        let chars = 0;
        let idx = 0;
        const bars = node.bars;
        let maxBar = Math.max(...bars);
        const maxBarWidth = ctx.measureText('    ').width;
        const barSpace = ctx.measureText(lines[lines.length - 1]).width / bars.length;
        const barWidth = Math.min(maxBarWidth, barSpace * 2 / 3);
        for (const bar of bars) {
            const relValue = bar / maxBar;
            let offset = idx * barSpace - barSpace * bars.length / 2 + (barSpace - barWidth);
            ctx.fillStyle = 'blue';
            ctx.fillRect(
                position.x + offset,
                position.y - totalHeight / 2 + vertMargin + 4 * height
                + 9 * height * (1 - bar / maxBar),
                barWidth,
                9 * height * bar / maxBar
            );
            idx++;
        }
    }
}

function formatPlotLayout(ctx, selectedLayout) {
    let height = 0;
    for (const part of ctx.font.split(" ")) {
        const fontHeight = parseInt(part);
        if (!isNaN(fontHeight)) {
            height = fontHeight;
            break;
        }
    }
    const vertMargin = 7;
    ctx.textAlign = 'center';

    for (const [nodeId, node] of Object.entries(panelState.networkData.nodes)) {
        if (node.points.length == 0 && node.lines.length == 0)
            continue;

        console.log("format plot:", node.id);
        let position;
        try {
            position = network.getPosition(node.id);
        } catch (ex) {
            console.error(ex);
            continue;
        }
        const lines = node.label.split("\n");
        const totalHeight = height * lines.length + vertMargin;
        const gridMargin = 6;
        const gridHeight = totalHeight - (4 * height + vertMargin) - 2 * gridMargin;
        let gridWidth = 0;
        for (const line of lines) {
            gridWidth = Math.max(gridWidth, ctx.measureText(line).width);
        }
        gridWidth -= 2 * gridMargin;

        ctx.fillStyle = 'blue';
        ctx.strokeStyle = 'blue';
        const els = node.points.length > 0 ? node.points : node.lines;
        let minx = Math.min(...els.map(el => el.length == 2 ? el[0] : Math.min(el[0], el[2])));
        let maxx = Math.max(...els.map(el => el.length == 2 ? el[0] : Math.max(el[0], el[2])));
        let miny = Math.min(...els.map(el => el.length == 2 ? el[1] : Math.min(el[1], el[3])));
        let maxy = Math.max(...els.map(el => el.length == 2 ? el[1] : Math.max(el[1], el[3])));

        minx = -Math.max(Math.abs(minx), Math.abs(maxx));
        maxx = Math.max(Math.abs(minx), Math.abs(maxx));
        miny = -Math.max(Math.abs(miny), Math.abs(maxy));
        maxy = Math.max(Math.abs(miny), Math.abs(maxy));

        let xunit = gridWidth / (maxx - minx);
        let yunit = gridHeight / (maxy - miny);

        let trdx = (x) => x * xunit; // translate dist
        let trpx = (x) => position.x + trdx(x); // translate x position
        let trdy = (y) => y * yunit; // translate y dist
        let trpy = (y, scale = false) => position.y
            + (4 * height + vertMargin) / 2
            - trdy(y); // translate y position

        // draw x axis
        ctx.fillRect(
            trpx(minx),
            trpy(0),
            trdx(maxx - minx),
            2
        );

        // draw y axis
        ctx.fillRect(
            trpx(0),
            trpy(maxy),
            2,
            trdy(maxy - miny)
        );

        for (const el of els) {
            // first point
            [x1, y1] = el.slice(0, 2)
            ctx.beginPath();
            ctx.arc(trpx(x1) + 1, trpy(y1) + 1, 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.textAlign = x1 > 0 ? 'right' : 'left';
            const textMargin = x1 > 0 ? -6 : 6;
            ctx.fillText(x1 + "," + y1, textMargin + trpx(x1), trpy(y1));
            if (el.length == 4) {
                // second point
                [x2, y2] = el.slice(2)
                ctx.beginPath();
                ctx.arc(trpx(x2) + 1, trpy(y2) + 1, 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.textAlign = x2 > 0 ? 'right' : 'left';
                const textMargin = x2 > 0 ? -6 : 6;
                ctx.fillText(x2 + "," + y2, textMargin + trpx(x2), trpy(y2));

                // draw line
                ctx.beginPath();
                ctx.lineTo(trpx(x1) + 1, trpy(y1) + 1);
                ctx.lineTo(trpx(x2) + 1, trpy(y2) + 1);
                ctx.stroke();
            }
        }
    }
}

function updateNetworkOptions(selectedLayout) {
    updateOptions = {
        edges: {
            physics: physics.checked,
        },
        layout: {
            randomSeed: 0,
            improvedLayout: true,
        },
        physics: {
            enabled: physics.checked,
            // to avoid overlap use barneshut
            "barnesHut": {
                "springConstant": 0,
                "avoidOverlap": 0.2
            },
            hierarchicalRepulsion: {
                nodeDistance: 140,
            },
        }
    };
    let treeLayout = getTreeLayout(selectedLayout);
    if (treeLayout) {
        updateOptions.layout.hierarchical = treeLayout;
    } else {
        updateOptions.layout.hierarchical = false;
    }
    if (network)
        network.setOptions(updateOptions);
}

function getTreeLayout(selectedLayout) {
    var hasTreeLayout = false;
    for (const [type, value] of Object.entries(selectedLayout)) {
        if (value === 'tree') {
            hasTreeLayout = true;
            break;
        }
    }
    if (!hasTreeLayout)
        return;
    return {
        direction: "UD",
        sortMethod: 'directed',
        parentCentralization: true,
        edgeMinimization: true,
        levelSeparation: 300,
        nodeSpacing: 200,
        treeSpacing: 300,
        blockShifting: true,
        shakeTowards: 'leaves'
    };
}

function createNetworkOptions(selectedLayout) {
    options = {
        nodes: {
            mass: 4,
            font: {
                face: 'monospace',
                size: 14,
                color: 'black'
            }
        },
        edges: {
            physics: physics.checked,
        },
        layout: {
            randomSeed: 0,
            improvedLayout: true,
            hierarchical: false
        },
        physics: {
            enabled: physics.checked,
            // to avoid overlap use barneshut
            "barnesHut": {
                "springConstant": 0,
                "avoidOverlap": 0.2
            },
            hierarchicalRepulsion: {
                nodeDistance: 140,
            },
        },
        interaction: {
            multiselect: true
        },
        groups: {
            VarNode: {
                color: { background: varNodeColor },
                borderWidth: 2,
                shape: 'box',
                mass: 1
            },
            Node: {
                color: { background: nodeColor },
                borderWidth: 2,
                shape: 'box',
                mass: 2
            }
        }
    };
    let treeLayout = getTreeLayout(selectedLayout);
    if (treeLayout) {
        options.layout.hierarchical = treeLayout;
    } else {
        options.layout.hierarchical = false;
    }
}

function updateSourceLines(source) {
    if (!source) {
        return;
    }
    let sourceLinesText = "";
    for (let i = 0; i < source.lines.length; i++) {
        if (i >= source.start && i <= source.end) {
            sourceLinesText += "<span class='highlight-text'>" + source.lines[i] + "\n</span>";
        } else {
            sourceLinesText += "<span>" + source.lines[i] + "\n</span>";
        }
    }
    sourceLines.innerHTML = "<pre>" + sourceLinesText + "</pre>";
}

function saveNetwork(data, source, selectedLayout) {
    if ("nodes" in data) {
        panelState.networkData.nodes = {};
        panelState.networkData.edges = {};
        for (const node of data.nodes) {
            panelState.networkData.nodes[node.id] = node;
        }
        for (const edge of data.edges) {
            panelState.networkData.edges[edge.id] = edge;
        }
    } else {
        for (const node of data.newNodes) {
            panelState.networkData.nodes[node.id] = node;
        }
        for (const edge of data.newEdges) {
            panelState.networkData.edges[edge.id] = edge;
        }

        for (const node of data.updateNodes) {
            panelState.networkData.nodes[node.id] = node;
        }
        for (const edge of data.updateEdges) {
            panelState.networkData.edges[edge.id] = edge;
        }

        for (const node of data.removeNodes) {
            delete panelState.networkData.nodes[node.id];
        }
        for (const edge of data.removeEdges) {
            delete panelState.networkData.edges[edge.id];
        }
    }
    panelState.source = source;
    panelState.selectedLayout = selectedLayout;
}

function saveNodePositions(network) {
    // get node positions
    for (let [nodeId, node] of Object.entries(network.getPositions())) {
        console.log("saving pos: ", nodeId, node);
        panelState.nodePositions[nodeId] = node;
    }
}

function onSelectedNode(e) {
    console.log(e);
    let nodeName = e.nodes[0];
    sendOptionChanged('selectedObject', nodeName, [nodeName]);
}

function restoreViewPosition(network) {
    if (panelState.position && panelState.scale) {
        let pos = panelState.position;
        let scl = panelState.scale;
        console.log("move to: ", panelState.position, panelState.scale);
        network.moveTo({
            position: pos,
            scale: scl
        });
        panelState.position = network.getViewPosition();
        panelState.scale = network.getScale();
        saveState();
    }
}

function requestCommand(command, data) {
    vscode.postMessage({
        type: 'command',
        command: command,
        data: data
    });
}

function sendOptionChanged(option, source, data) {
    vscode.postMessage({
        type: 'option',
        option: option,
        source: source,
        data: data
    });
}
# Visual DSA
Extension for Visualing Data Structures and Algorithms.  
Inspired by VS Code Debug Visualizer: https://github.com/hediet/vscode-debug-visualizer  
and jGRASP: https://www.jgrasp.org/  

![alt text](https://github.com/mku11/visual-dsa/blob/main/screenshots/screenshot_graph.png)

## Features
- Language support: Java, C#, TS/JS, Python.
- Graphical layouts supported for: Graphs, Trees, Linked Lists, Lists, Arrays (2D), Queue, Stack, Maps, Sets.
- Layouts applied per Object Type.
- Default (auto-suggested) layout assignments.
- Support for multiple variables/expressions.
- Graph layouts support user selection of children nodes, edges, and properties from objects attributes.
- Array layouts support markers for x and y axis.
- Hooks for extracting children nodes, and edges (ie: Extractor.getNodes() and getEdges()).
- Network graph history with code back stepping.
- GUI option for vis-network physics (enable/disable).
- Auto Step with delay.

## Supported Languages
- Java
- C#
- JavaScript/TypeScript
- Python

## Running the samples
- Open sample folder in VS Code
- Install the extensions for the language
- Build the project
- Ctrl+Shift+P and select Visual DSA: Start session

## Development
- Get vis-network via npm: https://www.npmjs.com/package/vis-network
- Or download from https://unpkg.com/vis-network/standalone/umd/vis-network.min.js
- Copy vis-network.min.js under webview/assets/js
- Open root folder in VS Code
- `npm install`
- `npm run watch` or `npm run compile`
- `F5` to start debugging the extension

## Visualization panel
Type or select the variables to display.
The variable and its references will display as nodes on the panel.
To change the layout for a type click on the variable and select:
	Layout: Graph, Tree, LinkedList, Array, Array2D, etc.
	Nodes: Connect to other variable nodes (for Graphs, Trees, LinkedLists, etc)
	Edges: Edge label (for Graphs)
	Properties: Property values to display
You can select multiple value using Ctrl

## Packaging
To package to a vsix:

Install Visual Studio Code Extensions
```
npm install -g @vscode/vsce
```

Package the extension:
```
vsce package
```

To publish:
```
vsce publish
```

For more info see: https://code.visualstudio.com/api/working-with-extensions/publishing-extension

## License:
Visual DSA is released under MIT License.  
Code includes other projects with their own license:  
vis-network MIT License https://github.com/visjs/vis-network  
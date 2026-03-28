# Visual DSA
Extension for Visualing Data Structures and Algorithms.  
Inspired by VS Code Debug Visualizer: https://github.com/hediet/vscode-debug-visualizer  
and jGRASP: https://www.jgrasp.org/  

![alt text](https://github.com/mku11/visual-dsa/blob/main/screenshots/screenshot_graph.png)

## Features
- Language support: Java, C#, TS/JS, Python.
- Graphical layouts supported for: Graphs, Trees, Linked Lists, Lists, Arrays (2D), Queue, Stack, Maps, Sets, Plot.
- Layouts applied per Object Type.
- Default (auto-suggested) layout assignments.
- Support for multiple variables/expressions.
- Graph layouts support user selection of children nodes, edges, and properties from objects attributes.
- Array layouts support markers for x, y, z axes.
- Automatic listing of local variables
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
- Open folder in VS Code
- Install the extensions for the language
- Build the project

## Quickstart
- Load your project in VS Code
- Ctrl+Shift+P and select Visual DSA: Start session
- Enter a variable or expression. Local variables will appear on the drop down list.
- If you use an expression make sure you have working code. 
- You can also add a call to a method/function to the expressions that will return an object. 
- If you use methods/function in the expression box make sure they return the same object with having the same name.
- You can add multiple expression by clicking on the '+' button.
- You can select the object node that appears and assign the layout for all objects of the same type.
- For graphs object you can select the children nodes and the edge values from the attributes section.
- Children Nodes and Edges can be an iterable (list,array) or a scalar member of the class object.
- The number of the nodes have to match the number of edges for correct display.
- You can also add additional properties from class members when available.
- You can select multiple values by pressing Ctrl and mouse click.
- For arrays 1d,2d you can select the direction and markers.
- Markers have to be integral types (int,long,etc) as long as they match with indexers in your preferred language.
- For arrays you can plot them using the plot layout (points, or lines).
- Plotable point arrays have to be of the structure: [[x1,y1],[x2,y2],...]
- Plotable line arrays have to be of the structure: [[x1,y1,x2,y2],[x3,y3,x4,y4],...]
- If you need to convert your structures you can use an expression call to an accessible method/function that returns the correct structure.
- If you want to want to keep the network display state and replay make sure you use only the Visual DSA control buttons (back, continue, next).
- The Visual DSA control buttons are thread safe and will store the correct state for replay.

## Custom Extractor
There is limited support for extracting node attributes via code using an Extractor class.
- The extractor class methods are called internally you just need to create them.
- For graphs Extractor supports Extractor.getNodes(), Extractor.getEdges().
- For plotting Extractor supports Extractor.getPlotPoints(), Extractor.getPlotLines().
- For all nodes Extractor supports Extractor.toString().
- See samples for more details.

## Development
- Get vis-network via npm: https://www.npmjs.com/package/vis-network
- Or download from https://unpkg.com/vis-network/standalone/umd/vis-network.min.js
- You can also use the get_libs.bat and get_libs.sh scripts to download all dependencies.
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
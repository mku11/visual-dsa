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

## Quickstart
- Load your project in VS Code
- Set your breakpoints
- Start debugging
- Ctrl+Shift+P and select Visual DSA: Start session
- Enter a variable or method/function call on the expression. Local variables will appear on the drop down list.
- If you use a complex expression make sure you have working code. 
- If you use methods/functions in the expression box make sure they return the same object with having the same name, this will force the ui to keep track of the same object.
- You can add multiple expressions by clicking on the '+' button.
- You can select the object that appears and assign attributes either at the Object or at the Object Type. If you assign to the Object type all Object will be assigned the same attributes.
- For graphs object you can select the children nodes and the edge values from the attributes section. This will expand the network and create new linked Objects as node in a network display.
- Children Nodes and Children Edges can be an iterable (list,array) or a scalar members of the Object. Iterable Objects nodes will show with a suffix of [] that means that all elements under the iterable will expand as nodes.
- The number of the nodes has to match the number of edges for correct display.
- You can display additional Properties at the bottom of the Object when available.
- You can select multiple values by pressing Ctrl and mouse click.
- For arrays 1d,2d you can select the direction and markers.
- Markers have to be integral types (int,long,etc) as long as they match with indexers in your project language.
- For arrays you can plot them using the plot. See below for formats, the [] brackets denote an array depending on your project language.
- For plotable points the format is: [[x1,y1],[x2,y2],...]
- For ploting lines the format is: [[x1,y1,x2,y2],[x3,y3,x4,y4],...]
- If you don't have the appropriate formats or data structures for display you can assign custom attributes using the Extractor, see below.
- You can replay the debugging steps using the Back and Next controls, just make sure you use only the Visual DSA control buttons, do not use the built-in vscode debug controls.

## Running the samples
- Open folder in VS Code
- Install the extensions for the language
- Build the project

## Custom attributes using Extractor
There is limited support for extracting custom attributes via code using an Extractor class.
- The extractor class methods are called internally for each node type you assign them using the Extractor.register() method.
- You can extract data by implementing the Extractor.extract() method. Return types supported are arrays of objects.
- See samples for more details.

## Development
To modify or contribute to Visual DSA:
- Install nodejs 21+
- Install git
- Clone or fork this repository.
- Get vis-network via npm: https://www.npmjs.com/package/vis-network
- Or download from https://unpkg.com/vis-network/standalone/umd/vis-network.min.js
- You can also use the get_libs.bat and get_libs.sh scripts to download all dependencies.
- Copy vis-network.min.js under webview/assets/js
- Open root folder in VS Code
- `npm install`
- `npm run watch` or `npm run compile`
- `F5` to start debugging the extension

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

## Installation
Click on Extensions on the left side in VS Code and click on the menu option "Install from VSIX".

## License:
Visual DSA is released under MIT License.  
Code includes other projects with their own license:  
vis-network MIT License https://github.com/visjs/vis-network  
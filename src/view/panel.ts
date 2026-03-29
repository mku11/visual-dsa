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

import * as vscode from 'vscode';
import * as fs from 'fs';
import { VisData, VisDiffData } from '../formatters/formatter';
import { Source } from '../controllers/controller';

export class Panel {
	public static readonly viewType = 'visualDSA';
	private static currentPanel: Panel | undefined;

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
	public static onViewStateChanged: (() => Promise<void>);
	public static onCommandRequested: ((message: { type: string, command: string, data: string }) => Promise<void>);
	public static onOptionsChanged: ((message: { type: string, option: string, source: string, data: string[] }) => Promise<void>);

	public static getPanel(): Panel | undefined {
		return Panel.currentPanel;
	}

	public static createOrShow(extensionUri: vscode.Uri) {
		const column = vscode.ViewColumn.Two;

		// If we already have a panel, show it.
		if (Panel.currentPanel) {
			Panel.currentPanel._panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			Panel.viewType,
			'Visual DSA',
			column,
			this.getWebviewOptions(extensionUri),
		);

		Panel.currentPanel = new Panel(panel, extensionUri);
	}

	public static revive(panel: vscode.WebviewPanel,
		extensionUri: vscode.Uri) {
		Panel.currentPanel = new Panel(panel, extensionUri);
	}

	static initialize(extensionUri: vscode.Uri) {
		if (vscode.window.registerWebviewPanelSerializer) {
			// Make sure we register a serializer in activation event
			vscode.window.registerWebviewPanelSerializer(Panel.viewType, {
				async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: unknown) {
					console.log(`Got state: ${state}`);
					// Reset the webview options so we use latest uri for `localResourceRoots`.
					webviewPanel.webview.options = Panel.getWebviewOptions(extensionUri);
					Panel.revive(webviewPanel, extensionUri);
				}
			});
		}
	}

	private constructor(panel: vscode.WebviewPanel,
		extensionUri: vscode.Uri) {
		this._panel = panel;
		this._extensionUri = extensionUri;

		// Set the webview's initial html content
		this._update();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programmatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		this._panel.onDidChangeViewState(
			async (_e: vscode.WebviewPanelOnDidChangeViewStateEvent,
				_disposables?: vscode.Disposable[]
			) => {
				if (Panel.onViewStateChanged) {
					await Panel.onViewStateChanged();
				}
			},
			null,
			this._disposables
		);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.type) {
					case 'command':
						if (Panel.onCommandRequested) {
							await Panel.onCommandRequested(message);
						}
						break;
					case 'option':
						if (Panel.onOptionsChanged) {
							await Panel.onOptionsChanged(message);
						}
						break;
				}
			},
			null,
			this._disposables
		);
	}

	public dispose() {
		Panel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	public createGraph(visData: VisData,
		source: Source,
		selectedLayout: Map<string, string>) {
		console.log("create graph");
		if (Panel.currentPanel) {
			Panel.currentPanel._panel.webview.postMessage({
				command: 'createGraph',
				data: visData,
				source: source,
				selectedLayout: Object.fromEntries(selectedLayout)
			});
		}
	}

	public updateGraph(visDiffData: VisDiffData,
		source: Source,
		selectedLayout: Map<string, string>) {
		console.log("create graph");
		if (Panel.currentPanel) {
			Panel.currentPanel._panel.webview.postMessage({
				command: 'updateGraph',
				data: visDiffData,
				source: source,
				selectedLayout: Object.fromEntries(selectedLayout)
			});
		}
	}

	public updateParams(variables: string[]) {
		console.log("update params");
		if (Panel.currentPanel) {
			Panel.currentPanel._panel.webview.postMessage(
				{
					command: 'updateParams',
					variables: variables
				});
		}
	}

	public updateVarOptions(
		selectedObject: string,
		selectedObjectType: string,
		nodes?: string[],
		selectedNodes?: string[],
		edges?: string[],
		selectedEdges?: string[],
		properties?: string[],
		selectedProperties?: string[],
		plot?: string[],
		selectedPlot?: string[],
		selectedLayout?: string,
		selectedOrientation?: string,
		selectedMarkers?: string,
	) {
		console.log("update var options");
		if (Panel.currentPanel) {
			Panel.currentPanel._panel.webview.postMessage(
				{
					command: 'updateVarOptions',
					selectedObject: selectedObject,
					selectedObjectType: selectedObjectType,
					nodes: nodes,
					selectedNodes: selectedNodes,
					edges: edges,
					selectedEdges: selectedEdges,
					properties: properties,
					selectedProperties: selectedProperties,
					plot: plot,
					selectedPlot: selectedPlot,
					selectedLayout: selectedLayout,
					selectedOrientation: selectedOrientation,
					selectedMarkers: selectedMarkers
				});
		}
	}

	public enableVarsOptions(value: boolean) {
		console.log("enable vars options");
		if (Panel.currentPanel) {
			Panel.currentPanel._panel.webview.postMessage(
				{
					command: 'enableVarsOptions',
					value: value
				});
		}
	}

	public showProgress(value: boolean) {
		if (Panel.currentPanel) {
			Panel.currentPanel._panel.webview.postMessage(
				{
					command: 'showProgress',
					value: value
				});
		}
	}

	public enableBtn(btn: string, value: boolean) {
		if (Panel.currentPanel) {
			Panel.currentPanel._panel.webview.postMessage(
				{
					command: 'enableButton',
					btn: btn,
					value: value
				});
		}
	}

	private _update() {
		const webview = this._panel.webview;
		this._panel.title = "VisualDSA";
		this._panel.webview.html = this._getHtmlForWebview(webview);
	}

	/* eslint-disable @typescript-eslint/no-unused-vars */
	private _getHtmlForWebview(webview: vscode.Webview) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'webview', 'assets', 'js', 'main.js');
		const visScriptPathOnDisk = vscode.Uri.joinPath(this._extensionUri, 'webview', 'assets', 'js', 'vis-network.min.js');

		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
		const visScriptUri = webview.asWebviewUri(visScriptPathOnDisk);

		// Local path to css styles
		const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'webview', 'assets', 'css', 'main.css');


		// var options url
		const varOptionsPath = vscode.Uri.joinPath(this._extensionUri, 'webview', 'var-options.html');
		const varOptionsUrl = webview.asWebviewUri(varOptionsPath);

		// images
		const backIconPath = vscode.Uri.joinPath(this._extensionUri, 'webview', 'assets', 'images', 'back.png');
		const contIconPath = vscode.Uri.joinPath(this._extensionUri, 'webview', 'assets', 'images', 'cont.png');
		const nextIconPath = vscode.Uri.joinPath(this._extensionUri, 'webview', 'assets', 'images', 'next.png');
		const runIconPath = vscode.Uri.joinPath(this._extensionUri, 'webview', 'assets', 'images', 'play.png');
		const pauseIconPath = vscode.Uri.joinPath(this._extensionUri, 'webview', 'assets', 'images', 'pause.png');
		const refreshIconPath = vscode.Uri.joinPath(this._extensionUri, 'webview', 'assets', 'images', 'refresh.png');
		const addIconPath = vscode.Uri.joinPath(this._extensionUri, 'webview', 'assets', 'images', 'plus.png');
		const parseIconPath = vscode.Uri.joinPath(this._extensionUri, 'webview', 'assets', 'images', 'parse.png');

		// Uri to load styles into webview
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

		const backIconUri = webview.asWebviewUri(backIconPath);
		const contIconUri = webview.asWebviewUri(contIconPath);
		const nextIconUri = webview.asWebviewUri(nextIconPath);
		const runIconUri = webview.asWebviewUri(runIconPath);
		const pauseIconUri = webview.asWebviewUri(pauseIconPath);
		const refreshIconUri = webview.asWebviewUri(refreshIconPath);
		const addIconUri = webview.asWebviewUri(addIconPath);
		const parseIconUri = webview.asWebviewUri(parseIconPath);

		// Use a nonce to only allow specific scripts to be run
		const nonce = this.getNonce();

		const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'webview', 'index.html');
		let htmlContents = fs.readFileSync(htmlPath.fsPath, 'utf8');
		htmlContents = eval('`' + htmlContents + '`');
		return htmlContents;
	}

	getNonce() {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		for (let i = 0; i < 32; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		return text;
	}

	static getWebviewOptions(extensionUri: vscode.Uri) {
		return {
			// Enable javascript in the webview
			enableScripts: true,

			retainContextWhenHidden: true,

			// And restrict the webview to only loading content from our extension's `media` directory.
			localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'webview')]
		};
	}
}

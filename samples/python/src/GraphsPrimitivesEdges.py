from typing import Any

# UI settings
# Expression: gmap
#   Type: dict
#     Layout: Graph
#     Nodes: @dictCustomNodes
#     Save: Object Attributes
#   Type: str
#     Layout: Graph
#     Nodes: @nodeCustomNodes
#     Edges: @nodeCustomEdges
#     Save: Object Type Attributes
class GraphsPrimitivesEdges:
    @staticmethod
    def run_main():
        GraphsPrimitivesEdges().start()

    def start(self):
        # graph with hashmap primitives
        gmap: dict[str, list[list[str]]] = {}
        gmap["1"] = [  # node value
            ["2", "3"],  # children nodes
            ["10", "20"],  # chidlren edges
        ]
        gmap["2"] = [["3", "4"], ["30", "40"]]
        gmap["3"] = []  # no children nodes
        gmap["4"] = []
        gmap["5"] = []

        print("done")


# custom extractor
class Extractor:
    # register the custom attributes
    @staticmethod
    def register_attrs() -> list[list[str, list[str]]]:
        return [
            ["dict", ["dictCustomNodes"]],
            ["str", ["nodeCustomNodes", "nodeCustomEdges"]],
        ]

    @staticmethod
    def extract_dictCustomNodes(
        obj: dict[str, list[list[str]]], root: Any
    ) -> list[str] | list[int] | list[object] | None:
        rootObject: dict[str, list[list[str]]] = root
        nodes: list[str] = []
        for k in rootObject.keys():
            nodes.append(k)
        return nodes

    @staticmethod
    def extract_nodeCustomNodes(
        obj: str, root: dict[str, list[list[str]]]
    ) -> list[list[str]]:
        nodes: list[list[str]] = root.get(obj, [])
        if obj in root and len(root[obj]) >= 1:
            return root[obj][0]

    @staticmethod
    def extract_nodeCustomEdges(
        obj: str, root: dict[str, list[list[str]]]
    ) -> list[str] | list[int] | list[object] | None:
        if obj in root and len(root[obj]) == 2:
            return root[obj][1]


GraphsPrimitivesEdges.run_main()

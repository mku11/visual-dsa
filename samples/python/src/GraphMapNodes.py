from __future__ import annotations
from typing import Any, TypeVar, Generic

T = TypeVar("T")


class GraphMapNodes:

    @staticmethod
    def run_main():
        GraphMapNodes().start()

    def start(self):

        # graph with hashmap node
        gmap: dict[
            GraphMapNodes.GraphMapNode[str], list[GraphMapNodes.GraphMapNode[str]]
        ] = {}
        gedges: dict[str, int] = {}
        Extractor.gedges = gedges

        # nodes
        node1 = GraphMapNodes.GraphMapNode[str]("1")
        node2 = GraphMapNodes.GraphMapNode[str]("2")
        node3 = GraphMapNodes.GraphMapNode[str]("3")
        node4 = GraphMapNodes.GraphMapNode[str]("4")
        gmap[node1] = [node2, node3]
        gmap[node2] = [node3, node4]
        gmap[node3] = []
        gmap[node4] = []

        # edges
        gedges[(node1, node2)] = 100
        gedges[(node1, node3)] = 200
        gedges[(node2, node3)] = 300
        gedges[(node2, node4)] = 400

        print("done")

    class GraphMapNode(Generic[T]):
        def get_value(self) -> T:
            return self.value

        def __init__(self, value: T):
            self.value = value

        def __str__(self):
            return str(self.value)


# custom extractor
class Extractor:
    # register the custom attributes
    @staticmethod
    def register_attrs() -> list[list[str, list[str]]]:
        return [
            ["dict", ["dictCustomNodes", "dictCustomValue"]],
            ["GraphMapNode", ["nodeCustomNodes", "nodeCustomEdges", "nodeCustomValue"]],
        ]

    @staticmethod
    def extract_dictCustomNodes(
        obj: dict[
            GraphMapNodes.GraphMapNode[str], list[GraphMapNodes.GraphMapNode[str]]
        ],
        root: dict[
            GraphMapNodes.GraphMapNode[str], list[GraphMapNodes.GraphMapNode[str]]
        ],
    ) -> list[GraphMapNodes.GraphMapNode[str]]:
        nodes: list[GraphMapNodes.GraphMapNode[str]] = []
        for key in root:
            nodes.append(key)
        return nodes

    @staticmethod
    def extract_dictCustomValue(
        obj: dict[
            GraphMapNodes.GraphMapNode[str],
            list[GraphMapNodes.GraphMapNode[str]],
        ],
        root: Any
    ) -> list[str]:
        sb = ""
        for key in obj.keys():
            if len(sb) > 0:
                sb += ","
            sb += key.get_value()
        return [sb]

    @staticmethod
    def extract_nodeCustomNodes(
        obj: GraphMapNodes.GraphMapNode[str],
        root: dict[
            GraphMapNodes.GraphMapNode[str],
            list[GraphMapNodes.GraphMapNode[str]],
        ],
    ) -> list[GraphMapNodes.GraphMapNode[str]]:
        return root.get(obj, [])

    @staticmethod
    def extract_nodeCustomEdges(
        obj: GraphMapNodes.GraphMapNode[str],
        root: dict[
            GraphMapNodes.GraphMapNode[str],
            list[GraphMapNodes.GraphMapNode[str]],
        ],
    ) -> list[str]:
        edges: list[int] | None = []
        for child in root.get(obj, []):
            edgeKey = (obj, child)
            edgeValue: int | None = Extractor.gedges.get(edgeKey)
            if edgeValue:
                edges.append(edgeValue)
        return edges

    @staticmethod
    def extract_nodeCustomValue(
        obj: GraphMapNodes.GraphMapNode[str],
        root: Any
    ) -> list[str]:
        return [str(obj.get_value())]


GraphMapNodes.run_main()

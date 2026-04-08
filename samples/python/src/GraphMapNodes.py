from __future__ import annotations
from typing import TypeVar, Generic
from collections import deque
from queue import Queue

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
            ["dict", ["customNodes", "customValue"]],
            ["GraphMapNode", ["customNodes", "customEdges", "customValue"]],
        ]

    @staticmethod
    def extract(
        type: str, attr: str, obj: object, root: object
    ) -> list[str] | list[int] | list[object] | None:

        print("extract:", type, attr)
        if type == "dict" and attr == "customNodes":
            nodes: list[GraphMapNodes.GraphMapNode[str]] = []
            for key in root:
                nodes.append(key)
                break
            return nodes
        elif type == "dict" and attr == "customValue":
            sb = ""
            objObject: dict[
                GraphMapNodes.GraphMapNode[str],
                list[GraphMapNodes.GraphMapNode[str]],
            ] = obj
            for key in objObject.keys():
                if len(sb) > 0:
                    sb += ","
                sb += key.get_value()
            return [sb]
        elif type == "GraphMapNode" and attr == "customNodes":
            rootObject: dict[
                GraphMapNodes.GraphMapNode[str],
                list[GraphMapNodes.GraphMapNode[str]],
            ] = root
            objObject: GraphMapNodes.GraphMapNode[str] = obj
            nodes: list[GraphMapNodes.GraphMapNode[str]] | None = rootObject.get(
                objObject
            )
            if nodes:
                return nodes
        elif type == "GraphMapNode" and attr == "customEdges":
            rootObject: dict[
                GraphMapNodes.GraphMapNode[str],
                list[GraphMapNodes.GraphMapNode[str]],
            ] = root
            objObject: GraphMapNodes.GraphMapNode[str] = obj
            edges: list[int] | None = []
            for child in rootObject.get(objObject, []):
                edgeKey = (objObject, child)
                edgeValue: int | None = Extractor.gedges.get(edgeKey)
                if edgeValue:
                    edges.append(edgeValue)
            return edges
        elif type == "GraphMapNode" and attr == "customValue":
            objObject: GraphMapNodes.GraphMapNode[str] = obj
            return [str(objObject.get_value())]


GraphMapNodes.run_main()

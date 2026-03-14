from __future__ import annotations
from typing import TypeVar, Generic
from collections import deque
from queue import Queue

T = TypeVar("T")


class GraphMapNodes:

    @staticmethod
    def run_main():

        # graph with hashmap node
        gmap: dict[
            GraphMapNodes.GraphMapNode[str], list[GraphMapNodes.GraphMapNode[str]]
        ] = {}
        node1 = GraphMapNodes.GraphMapNode[str]("1")
        node2 = GraphMapNodes.GraphMapNode[str]("2")
        node3 = GraphMapNodes.GraphMapNode[str]("3")
        node4 = GraphMapNodes.GraphMapNode[str]("4")

        gmap[node1] = [node2, node3]
        gmap[node2] = [node3, node4]
        gmap[node3] = []
        gmap[node4] = []
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
    # register the custom types
    @staticmethod
    def register_types() -> list[str]:
        return ["dict", "GraphMapNode"]

    @staticmethod
    def get_nodes(
        node: (
            dict[GraphMapNodes.GraphMapNode[str], list[GraphMapNodes.GraphMapNode[str]]]
            | GraphMapNodes.GraphMapNode[str]
        ),
        root: dict[
            GraphMapNodes.GraphMapNode[str], list[GraphMapNodes.GraphMapNode[str]]
        ],
    ) -> list[any]:

        if isinstance(node, dict):
            nodes: list[GraphMapNodes.GraphMapNode[str]] = []
            for key in root:
                nodes.append(key)
                break
            return nodes
        return root[node]

    @staticmethod
    def __str__(node):
        if type(node) == dict:
            sb = ""
            nodeObj = node
            for key in nodeObj.keys:
                sb += key.value
                sb += "\n"
            return sb
        elif type(node) == GraphMapNodes.GraphMapNode:
            return str(node.get_value())
        return ""


GraphMapNodes.run_main()

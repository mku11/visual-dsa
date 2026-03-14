from __future__ import annotations
from typing import TypeVar, Generic
from collections import deque
from queue import Queue

T = TypeVar("T")

class Graphs:

    @staticmethod
    def run_main():
        # nodes of a graph
        gnode0 = Graphs.GraphNode[str]("0")
        gnode1 = Graphs.GraphNode[str]("1")
        gnode2 = Graphs.GraphNode[str]("2")
        gnode3 = Graphs.GraphNode[str]("3")
        gnode4 = Graphs.GraphNode[str]("4")

        gnode0.add(gnode1, 10)
        gnode0.add(gnode2, 20)
        gnode2.add(gnode3, 15)
        gnode3.add(gnode2, 10)
        gnode3.add(gnode4, 25)
        gnode1.add(gnode4, 45)
        gnode4.add(gnode2, 55)

        # wrap to a graph
        graph: Graphs.Graph[str] = Graphs.Graph[str](gnode0)
        graphRoot: Graphs.GraphNode[str] = graph.get_root()
        graphRoot.add(Graphs.GraphNode[str]("5"), 11)
        gnode1.add(Graphs.GraphNode[str]("6"), 12)
        gnode2.add(Graphs.GraphNode[str]("7"), 13)

        Graphs.bfs(gnode0)

    @staticmethod
    def bfs(node: Graphs.GraphNode[str]):
        q: Queue[Graphs.GraphNode[str]] = Queue()
        q.put(node)
        v: set[Graphs.GraphNode[str]] = set[Graphs.GraphNode[str]]()
        steps = 0
        size = len(q.queue)
        while len(q.queue) > 0:
            x: Graphs.GraphNode[str] = q.get()
            size -= 1
            for child in x.children:
                if child in v:
                    continue
                q.put(child)
                v.add(child)

            if size == 0:
                steps += 1
                size = len(q.queue)

    class Graph(Generic[T]):
        def __init__(self, root: Graphs.GraphNode[T]):
            self.root: Graphs.GraphNode[T] = root

        def get_root(self) -> Graphs.GraphNode[T]:
            return self.root

    class GraphNode(Generic[T]):
        def get_value(self) -> T:
            return self.value

        def __init__(self, value: T):
            self.value = value
            self.children: list[Graphs.GraphNode[T]] = []
            self.childrenCost: list[Graphs.GraphNode[T]] = []

        def add(self, node: Graphs.GraphNode[T], cost: int):
            self.children.append(node)
            self.childrenCost.append(cost)

        def __str__(self):
            return str(self.value)

# custom extractor
class Extractor:
    # register the custom types
    @staticmethod
    def register_types() -> list[str]:
        return ["GraphNode"]

    @staticmethod
    def __str__(node: any):
        if type(node) == Graphs.GraphNode:
            return str(node.get_value())
        return ""

Graphs.run_main()
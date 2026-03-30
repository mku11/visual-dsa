from __future__ import annotations
from typing import TypeVar, Generic
from collections import deque

T = TypeVar("T")


class Trees:

    @staticmethod
    def run_main():
        Trees().start()

    def start(self):
        # nodes of a tree
        root: Node[str] = Node[str]("0")
        node1: Node[str] = Node[str]("1")
        node2: Node[str] = Node[str]("2")
        node3: Node[str] = Node[str]("3")
        node4: Node[str] = Node[str]("4")
        node5: Node[str] = Node[str]("5")
        node6: Node[str] = Node[str]("6")

        root.add(node1)
        node1.add(node2)
        node1.add(node3)
        root.add(node4)
        node4.add(node5)
        node4.add(node6)

        # wrap to a tree
        tree: Tree[str] = Tree[str](root)
        Trees.visit_tree(tree.get_root(), tree.get_root())

        print("done")

    @staticmethod
    def visit_tree(node: Node[str], root: Node[str]):
        if node is None:
            return
        print(node.value)
        for child in node.children:
            Trees.visit_tree(child, root)


class Tree(Generic[T]):

    def __init__(self, root: Node[T]):
        self.root = root

    def get_root(self) -> Node[T]:
        return self.root


class Node(Generic[T]):
    def __init__(self, value: T):
        self.children: list[Node[T]] = []
        self.value: T = value

    def add(self, value: Node[T]):
        self.children.append(value)

    def __str__(self) -> str:
        return str(self.value)


Trees.run_main()

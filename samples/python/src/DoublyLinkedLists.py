from __future__ import annotations
from typing import TypeVar, Generic
from collections import deque

T = TypeVar("T")


class DoublyLinkedLists:

    @staticmethod
    def run_main():
        DoublyLinkedLists().start()

    def start(self):
        # custom linkedlist
        linkedList = DoublyLinkedLists.DoublyLinkedList[str]()
        for i in range(10):
            linkedList.append(str(i))

        node: DoublyLinkedLists.Node[str] = linkedList.get_head()
        while node != None:
            print(node.get_value())
            if node.get_value() == "5":
                node.insert_next(DoublyLinkedLists.Node[str]("50"))
                break
            node = node.get_next()
        print("done")

    class DoublyLinkedList(Generic[T]):

        def __init__(self):
            self.head: DoublyLinkedLists.Node[T] = None
            self.tail: DoublyLinkedLists.Node[T] = None

        def get_head(self) -> DoublyLinkedLists.Node[T]:
            return self.head

        def get_tail(self) -> DoublyLinkedLists.Node[T]:
            return self.tail

        def append(self, value: T):
            if self.head is None:
                self.head = DoublyLinkedLists.Node[T](value)
                self.tail = self.head
            else:
                self.tail.insert_next(DoublyLinkedLists.Node[T](value))
                self.tail = self.tail.next

    class Node(Generic[T]):

        def __init__(self, value: T):
            self.value: T = value
            self.next: DoublyLinkedLists.Node[T] = None
            self.prev: DoublyLinkedLists.Node[T] = None

        def get_value(self) -> T:
            return self.value

        def get_next(self) -> DoublyLinkedLists.Node[T]:
            return self.next

        def get_prev(self) -> DoublyLinkedLists.Node[T]:
            return self.prev

        def insert_next(self, node: DoublyLinkedLists.Node[T]):
            t: DoublyLinkedLists.Node[T] = self.next
            self.next = node
            node.next = t
            if t is not None:
                t.prev = node
            node.prev = self

        def __str__(self) -> str:
            return str(self.value)

DoublyLinkedLists.run_main()

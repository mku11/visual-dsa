from __future__ import annotations
from typing import TypeVar, Generic
from collections import deque

T = TypeVar("T")


# UI settings
# Expression: linkedList
#   Type: LinkedListCustom
#     Layout: Linked List
#     Nodes: head
#     Save: Object Type Attributes
#   Type: LinkedListNode
#     Layout: Linked List
#     Nodes: next
#     Properties: value
#     Save: Object Type Attributes

# Expression: linkedList2
#   Type: deque
#     Layout: Linked List
#     Save: Object Type Attributes
#   Type: str
#     Layout: Linked List
#     Save: Object Type Attributes
class LinkedLists:

    @staticmethod
    def run_main():
        LinkedLists().start()

    def start(self):
        # custom linkedlist
        linkedList: LinkedListCustom[str] = LinkedListCustom[str]()
        linkedList.append("1")
        linkedList.append("2")
        linkedList.append("3")
        linkedList.append("4")

        node: LinkedListCustom.LinkedListNode[str] = linkedList.get_head()
        while node != None:
            print(node.get_value())
            if node.get_value() == "3":
                node.insert_next(LinkedListCustom.LinkedListNode[str]("5"))
                break
            node = node.get_next()

        # Python dequeue as linked list
        linkedList2: deque = deque()
        linkedList2.append("1")
        linkedList2.append("2")
        linkedList2.append("3")
        linkedList2.append("4")

        print("done")

class LinkedListCustom(Generic[T]):

    def __init__(self):
        self.head: LinkedListCustom.LinkedListNode[T] | None = None

    def get_head(self) -> LinkedListNode:
        return self.head

    def append(self, value: T):
        if self.head is None:
            self.head = LinkedListCustom.LinkedListNode[T](value)
        else:
            m: LinkedListCustom.LinkedListNode[T] = self.head
            while m.next is not None:
                m = m.next
            m.next = LinkedListCustom.LinkedListNode[T](value)

    class LinkedListNode(Generic[T]):

        def __init__(self, value: T):
            self.value: T = value
            self.next: LinkedListCustom.LinkedListNode[T] | None = None

        def get_value(self) -> T:
            return self.value

        def get_next(self) -> LinkedListCustom.LinkedListNode[T]:
            return self.next

        def insert_next(self, node: LinkedListCustom.LinkedListNode[T]):
            t: LinkedListCustom.LinkedListNode[T] = self.next
            self.next = node
            node.next = t

        def __str__(self) -> str:
            return str(self.value)

LinkedLists.run_main()
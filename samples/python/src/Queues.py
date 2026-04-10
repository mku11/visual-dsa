from __future__ import annotations
from typing import TypeVar, Generic
from queue import PriorityQueue, Queue

T = TypeVar("T")
S = TypeVar("S")
P = TypeVar("P")

# UI settings
# Expression: q
#   Type: Queue
#     Layout: Queue
#     Save: Object Attributes

class Queues:

    @staticmethod
    def run_main():
        Queues().start()

    def start(self):
        q: Queue[str] = Queue[str]()
        q.put("1")
        q.put("3")
        q.put("2")
        q.put("4")

        while len(q.queue) > 0:
            node: str = q.get()
            print(node)

        qo: Queue[QueueNode[str, int]] = Queue[QueueNode[str, int]]()
        qo.put(QueueNode[str, int]("1", 1))
        qo.put(QueueNode[str, int]("3", 3))
        qo.put(QueueNode[str, int]("2", 2))
        qo.put(QueueNode[str, int]("4", 4))

        while len(qo.queue) > 0:
            node: QueueNode[str, int] = qo.get()
            print(str(node.value) + ":" + str(node.data))

        pq: PriorityQueue = PriorityQueue()
        pq.put(1, "1")
        pq.put(3, "3")
        pq.put(2, "2")
        pq.put(4, "4")

        while len(pq.queue) > 0:
            value = pq.get()
            print(value)

        print("done")

class QueueNode(Generic[T, S]):
    def __init__(self, value: T, data: S):
        self.value: T = value
        self.data: S = data

    def __hash__(self):
        return super().__hash__()

    def __str__(self):
        return str(self.data) + ":" + str(self.value)


Queues.run_main()

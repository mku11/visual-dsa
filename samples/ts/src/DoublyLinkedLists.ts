class DoublyLinkedLists {

    static runMain() {
        new DoublyLinkedLists().test();
    }

    public test() {
        // custom linkedlist
        const linkedList: DoublyLinkedList<string> = new DoublyLinkedList<string>();
        for (let i = 0; i < 7; i++) {
            linkedList.append(String(i));
        }

        let node: Node<string> | undefined = linkedList.getHead();
        while (node != null) {
            console.log(node.getValue());
            if (node.getValue() === "5") {
                node.insertNext(new Node<string>("50"));
                break;
            }
            node = node.getNext();
        }
    }
}

export class DoublyLinkedList<T> {

    private head: Node<T> | undefined;
    private tail: Node<T> | undefined;

    public getHead(): Node<T> | undefined {
        return this.head;
    }

    public getTail(): Node<T> | undefined {
        return this.tail;
    }

    public append(value: T) {
        if (this.head == null) {
            this.head = new Node<T>(value);
            this.tail = this.head;
        } else {
            this.tail?.insertNext(new Node<T>(value));
            this.tail = this.tail?.getNext();
        }
    }
}

export class Node<T> {

    private value: T;
    private next: Node<T> | undefined;
    private prev: Node<T> | undefined;

    public constructor(value: T) {
        this.value = value;
    }

    public getValue(): T {
        return this.value;
    }

    public getNext(): Node<T> | undefined {
        return this.next;
    }

    public getPrev(): Node<T> | undefined {
        return this.prev;
    }

    public insertNext(node: Node<T>) {
        const t: Node<T> | undefined = this.next;
        this.next = node;
        node.next = t;
        if (t != null)
            t.prev = node;
        node.prev = this;
    }

    public toString(): string {
        return String(this.value);
    }
}

DoublyLinkedLists.runMain();
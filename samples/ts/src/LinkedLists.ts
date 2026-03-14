class LinkedLists {

    public static runMain() {
        // custom linkedlist
        const linkedList: LinkedListCustom<string> = new LinkedListCustom<string>();
        linkedList.append("1");
        linkedList.append("2");
        linkedList.append("3");
        linkedList.append("4");

        let node: LinkedListNode<string> | undefined = linkedList.getHead();
        while (node != null) {
            console.log(node.getValue());
            if (node.getValue() === "3") {
                node.insertNext(new LinkedListNode<string>("5"));
                break;
            }
            node = node.getNext();
        }
    }

}

// custom extractor
export class Extractor {

    // register the custom types
    public static registerTypes(): Array<string> {
        return [
            "LinkedListNode", "*"];
    }

    public static toString(node: LinkedListNode<string>) {
        return node.getValue().toString();
    }

}

class LinkedListCustom<T> {
    private head: LinkedListNode<T> | undefined;

    public getHead(): LinkedListNode<T> | undefined {
        return this.head;
    }

    public append(value: T) {
        if (this.head == null) {
            this.head = new LinkedListNode<T>(value);
        } else {
            let m: LinkedListNode<T> | undefined = this.head;
            while (m?.getNext() != null) {
                m = m.getNext();
            }
            m?.setNext(new LinkedListNode<T>(value));
        }
    }

}

class LinkedListNode<T> {

    private value: T;
    private next: LinkedListNode<T> | undefined;

    public getValue(): T {
        return this.value;
    }

    public getNext(): LinkedListNode<T> | undefined {
        return this.next;
    }

    public setNext(value: LinkedListNode<T> | undefined) {
        this.next = value;
    }

    public insertNext(node: LinkedListNode<T>) {
        const t: LinkedListNode<T> | undefined = this.next;
        this.next = node;
        node.next = t;
    }

    public constructor(value: T) {
        this.value = value;
    }

    public toString(): string {
        return String(this.value);
    }
}
LinkedLists.runMain();
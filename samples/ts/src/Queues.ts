export class Queues {

    public static runMain() {
        const q: string[] = [];
        q.push("1");
        q.push("3");
        q.push("2");
        q.push("4");

        while (q.length > 0) {
            const node: string | undefined = q.shift();
            console.log(node);
        }

        const qo: QueueNode<string, number>[] = [];
        qo.push(new QueueNode<string, number>("1", 1));
        qo.push(new QueueNode<string, number>("3", 3));
        qo.push(new QueueNode<string, number>("2", 2));
        qo.push(new QueueNode<string, number>("4", 4));

        while (qo.length > 0) {
            const node: QueueNode<string, number> | undefined = qo.shift();
            console.log(node?.value + ":" + node?.data);
        }
    }
}

export class PriorityNode<T, P> {
    public value: T;
    public priority: P;

    public constructor(value: T, prio: P) {
        this.value = value;
        this.priority = prio;
    }

    public toString(): string {
        return this.priority + ":" + this.value;
    }
}

class QueueNode<T, S> {
    public value: T;
    public data: S;

    public constructor(value: T, data: S) {
        this.value = value;
        this.data = data;
    }

    public toString(): string {
        return this.data + ":" + this.value;
    }
}
Queues.runMain();
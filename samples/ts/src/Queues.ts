export class Queues {

    public static runMain() {
        // User Settings
        
        // Expression: qo

        // Type: QueueNode
        // Layout: Tree
        // Children Nodes: children[]
        const q: string[] = [];
        q.push("1");
        q.push("3");
        q.push("2");
        q.push("4");

        while (q.length > 0) {
            const node: string | undefined = q.shift();
            console.log(node);
        }

        // queue with nodes
        const qo: QueueNode<string,number>[] = [];
        qo.push(new QueueNode("1", 1));
        qo.push(new QueueNode("3", 3));
        qo.push(new QueueNode("2", 2));
        qo.push(new QueueNode("4", 4));

        while (qo.length > 0) {
            const node: string | undefined = q.shift();
            console.log(node);
        }

        // Queue with value and priority number
        const pq: PriorityNode<string, number>[] = [];
        pq.push(new PriorityNode<string, number>("1", 1));
        pq.push(new PriorityNode<string, number>("3", 3));
        pq.push(new PriorityNode<string, number>("2", 2));
        pq.push(new PriorityNode<string, number>("4", 4));

        while (qo.length > 0) {
            const node: PriorityNode<string, number> | undefined = pq.shift();
            console.log(node?.value + ":" + node?.priority);
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
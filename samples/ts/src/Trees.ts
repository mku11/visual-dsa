class Trees {

    public static runMain() {
        new Trees().start();
    }

    start() {
        // nodes of a tree

        // User Settings
        
        // Expression: node1

        // Type: Node
        // Layout: Tree
        // Children Nodes: children[]
        const root: Node<string> = new Node<string>("0");
        const node1: Node<string> = new Node<string>("1");
        const node2: Node<string> = new Node<string>("2");
        const node3: Node<string> = new Node<string>("3");
        const node4: Node<string> = new Node<string>("4");
        const node5: Node<string> = new Node<string>("5");
        const node6: Node<string> = new Node<string>("6");
        root.add(node1);
        node1.add(node2);
        node1.add(node3);
        root.add(node4);
        node4.add(node5);
        node4.add(node6);

        // // wrap to a tree
        const tree: Tree<string> = new Tree<string>(root);
        Trees.visitTree(tree.getRoot(), tree.getRoot());

        console.log("done");
    }

    private static visitTree(node: Node<string>, root: Node<string>) {
        if (node == null) {
            return;
        }
        console.log(node.value);
        for (const child of node.children) {
            this.visitTree(child, root);
        }
    }
}

class Tree<T> {

    private root: Node<T>;

    public constructor(root: Node<T>) {
        this.root = root;
    }

    public getRoot(): Node<T> {
        return this.root;
    }
}

class Node<T> {

    public value: T;
    public children: Array<Node<T>> = new Array<Node<T>>();

    public constructor(value: T) {
        this.value = value;
    }

    public add(value: Node<T>) {
        this.children.push(value);
    }
}
Trees.runMain();

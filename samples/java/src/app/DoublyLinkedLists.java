package app;

// UI settings
// Expression: linkedList
//   Type: DoublyLinkedLists.DoublyLinkedList
//     Layout: Linked List
//     Nodes: head
//     Save: Object Type Attributes
//   Type: DoublyLinkedLists.Node
//     Layout: Linked List
//     Nodes: next,prev (ctrl+click to select mutliple)
//     Properties: value
//     Save: Object Type Attributes

public class DoublyLinkedLists {

    public static void main(String[] args) {
        // custom linkedlist
        DoublyLinkedList<String> linkedList = new DoublyLinkedList<>();
        for(int i=0; i<10; i++) {
            linkedList.append(String.valueOf(i));
        }

        Node<String> node = linkedList.getHead();
        while (node != null) {
            System.out.println(node.getValue());
            if (node.getValue().equals("5")) {
                node.insertNext(new Node<>("50"));
                break;
            }
            node = node.getNext();
        }

        System.out.println("done");
    }

    private static class DoublyLinkedList<T> {

        protected Node<T> head;
        protected Node<T> tail;

        public Node<T> getHead() {
            return head;
        }

        @SuppressWarnings("unused")
        public Node<T> getTail() {
            return tail;
        }

        public void append(T value) {
            if (head == null) {
                head = new Node<>(value);
                tail = head;
            } else {
                tail.insertNext(new Node<>(value));
                tail = tail.next;
            }
        }
    }

    private static class Node<T> {

        protected T value;
        protected Node<T> next;
        protected Node<T> prev;

        public Node(T value) {
            this.value = value;
        }

        public T getValue() {
            return value;
        }

        public Node<T> getNext() {
            return next;
        }

        @SuppressWarnings("unused")
        public Node<T> getPrev() {
            return prev;
        }

        public void insertNext(Node<T> node) {
            Node<T> t = this.next;
            this.next = node;
            node.next = t;
            if (t != null)
                t.prev = node;
            node.prev = this;
        }

        @Override
        public String toString() {
            return value.toString();
        }
    }
}
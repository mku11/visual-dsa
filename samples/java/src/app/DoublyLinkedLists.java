package app;

import java.util.ArrayList;
import java.util.List;

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
    }

    private static class DoublyLinkedList<T> {

        private Node<T> head;
        private Node<T> tail;

        public Node<T> getHead() {
            return head;
        }

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

        private T value;
        private Node<T> next;
        private Node<T> prev;

        public Node(T value) {
            this.value = value;
        }

        public T getValue() {
            return value;
        }

        public Node<T> getNext() {
            return next;
        }

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

    // custom extractor
    static class Extractor {

        // register the custom types
        public static List<String> registerTypes() {
            return new ArrayList<>(List.of(
                    "DoublyLinkedListCustom$DoublyLinkedListNode"));
        }

        public static String toString(String type, Node<?> node) {
            return node.getValue().toString();
        }

    }

}
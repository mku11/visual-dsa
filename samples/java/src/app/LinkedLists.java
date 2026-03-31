package app;

import java.util.LinkedList;

public class LinkedLists {

    public static void main(String[] args) {
        new LinkedLists().start();
    }

    public void start() {
        // custom linkedlist
        LinkedListCustom<String> linkedList = new LinkedListCustom<>();
        linkedList.append("1");
        linkedList.append("2");
        linkedList.append("3");
        linkedList.append("4");

        LinkedListCustom.LinkedListNode<String> head = linkedList.getHead();
        while (head != null) {
            if (head.getValue().equals("3")) {
                head.insertNext(new LinkedListCustom.LinkedListNode<>("5"));
                break;
            }
            head = head.getNext();
        }

        // JDK linked list
        LinkedList<String> linkedList2 = new LinkedList<String>();
        linkedList2.add("1");
        linkedList2.add("2");
        linkedList2.add("3");
        linkedList2.add("4");

        System.out.println("done");
    }
}

class LinkedListCustom<T> {

    private LinkedListNode<T> head;

    public LinkedListNode<T> getHead() {
        return head;
    }

    public void append(T value) {
        if (head == null) {
            head = new LinkedListNode<>(value);
        } else {
            LinkedListNode<T> m = head;
            while (m.next != null) {
                m = m.next;
            }
            m.next = new LinkedListNode<>(value);
        }
    }

    public static class LinkedListNode<T> {

        private T value;
        private LinkedListNode<T> next;

        public T getValue() {
            return value;
        }

        public LinkedListNode<T> getNext() {
            return next;
        }

        public void insertNext(LinkedListNode<T> node) {
            LinkedListNode<T> t = this.next;
            this.next = node;
            node.next = t;
        }

        public LinkedListNode(T value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return value.toString();
        }
    }
}

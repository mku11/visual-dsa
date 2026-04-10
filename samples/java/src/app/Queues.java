package app;

import java.util.LinkedList;
import java.util.PriorityQueue;
import java.util.Queue;

public class Queues {

    public static void main(String[] args) {
        Queue<String> q = new LinkedList<>();
        q.add("1");
        q.add("3");
        q.add("2");
        q.add("4");

        while (!q.isEmpty()) {
            String node = q.remove();
            System.out.println(node);
        }
    
        Queue<QueueNode<String, Integer>> qo = new LinkedList<>();
        qo.add(new QueueNode<>("1", 1));
        qo.add(new QueueNode<>("3", 3));
        qo.add(new QueueNode<>("2", 2));
        qo.add(new QueueNode<>("4", 4));

        while (!qo.isEmpty()) {
            QueueNode<String, Integer> node = qo.remove();
            System.out.println(node.value + ":" + node.data);
        }
    
        PriorityQueue<PriorityNode<String, Integer>> pq = new PriorityQueue<>((a, b) -> a.priority - b.priority);
        pq.add(new PriorityNode<>("1", 1));
        pq.add(new PriorityNode<>("3", 3));
        pq.add(new PriorityNode<>("2", 2));
        pq.add(new PriorityNode<>("4", 4));

        while (!pq.isEmpty()) {
            PriorityNode<String, Integer> node = pq.remove();
            System.out.println(node.value + ":" + node.priority);
        }
    }
}


class PriorityNode<T, P> {
    protected T value;
    protected P priority;

    public PriorityNode(T value, P prio) {
        this.value = value;
        this.priority = prio;
    }

    public String toString() {
        return this.priority + ":" + this.value;
    }
}

class QueueNode<T, S> {
    protected T value;
    protected S data;

    public QueueNode(T value, S data) {
        this.value = value;
        this.data = data;
    }

    public String toString() {
        return this.data + ":" + this.value;
    }
}
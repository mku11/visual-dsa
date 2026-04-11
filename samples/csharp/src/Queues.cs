using System;
using System.Collections.Generic;

// UI settings
// Expression: q
//   Type: System.Collections.Generic.Queue<string>
//     Layout: Queue
//     Save: Object Attributes

internal class Queues
{
    public static void RunMain(string[] args)
    {
        new Queues().Start();
    }

    public void Start()
    {
        Queue<string> q = new Queue<string>();
        q.Enqueue("1");
        q.Enqueue("3");
        q.Enqueue("2");
        q.Enqueue("4");

        while (q.Count > 0)
        {
            string node = q.Dequeue();
            Console.WriteLine(node);
        }

        Queue<QueueNode<string, int>> qo = new Queue<QueueNode<string, int>>();
        qo.Enqueue(new QueueNode<string, int>("1", 1));
        qo.Enqueue(new QueueNode<string, int>("3", 3));
        qo.Enqueue(new QueueNode<string, int>("2", 2));
        qo.Enqueue(new QueueNode<string, int>("4", 4));

        while (qo.Count > 0)
        {
            QueueNode<string, int> node = qo.Dequeue();
            Console.WriteLine(node.value + ":" + node.data);
        }

        PriorityQueue<string, int> pq = new PriorityQueue<string, int>();
        pq.Enqueue("1", 1);
        pq.Enqueue("3", 3);
        pq.Enqueue("2", 2);
        pq.Enqueue("4", 4);
        while (pq.Count > 0)
        {
            string node = pq.Dequeue();
            Console.WriteLine(node);
        }
        
        Console.WriteLine("done");
    }
}

class QueueNode<T, S>
{
    public T value;
    public S data;

    public QueueNode(T value, S data)
    {
        this.value = value;
        this.data = data;
    }

    public override string ToString()
    {
        return this.data + ":" + this.value;
    }
}
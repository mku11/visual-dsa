using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

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

        List<(string,int)> list = System.Linq.Enumerable.Select(pq.UnorderedItems, 
            (xRepr)=>xRepr).OrderBy((x)=>x.Item2).ToList();
        list.Sort(0, pq.UnorderedItems.Count, 
            System.Collections.Generic.Comparer<(string,int)>.
                Create((a,b)=>a.Item2 - b.Item2));
        
        Console.WriteLine("done");
    }
}


class PriorityNode<T, P>
{
    public T value;
    public P priority;

    public PriorityNode(T value, P prio)
    {
        this.value = value;
        this.priority = prio;
    }

    public String toString()
    {
        return this.priority + ":" + this.value;
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
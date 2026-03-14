using System;
using System.Collections.Generic;

public class LinkedLists
{

    public static void RunMain(string[] args)
    {
        // custom linkedlist
        LinkedListCustom<string> linkedList = new LinkedListCustom<string>();
        linkedList.Append("1");
        linkedList.Append("2");
        linkedList.Append("3");
        linkedList.Append("4");

        LinkedListCustom<string>.LinkedListNode<string> head = linkedList.Head;
        while (head != null)
        {
            Console.WriteLine(head.Value);
            if (head.Value.Equals("3"))
            {
                head.insertNext(new LinkedListCustom<string>.LinkedListNode<string>("5"));
                break;
            }
            head = head.Next;
        }

        // JDK linked list
        LinkedList<string> linkedList2 = new LinkedList<string>();
        linkedList2.AddLast("1");
        linkedList2.AddLast("2");
        linkedList2.AddLast("3");
        linkedList2.AddLast("4");
    }

    // custom extractor
    class Extractor
    {

        // register the custom types
        public static IList<string> registerTypes()
        {
            return new List<string>([
                    "LinkedListCustom$LinkedListNode"]);
        }

        public static string toString(LinkedListCustom<string>.LinkedListNode<string> node)
        {
            return node.Value.ToString();
        }

    }
}

public class LinkedListCustom<T>
{
    public LinkedListNode<T> Head { get; private set; }

    public void Append(T value)
    {
        if (Head == null)
        {
            Head = new LinkedListNode<T>(value);
        }
        else
        {
            LinkedListNode<T> m = Head;
            while (m.Next != null)
            {
                m = m.Next;
            }
            m.Next = new LinkedListNode<T>(value);
        }
    }

    public class LinkedListNode<T>
    {

        public T Value { get; private set; }
        public LinkedListNode<T> Next { get; internal set; }

        public void insertNext(LinkedListNode<T> node)
        {
            LinkedListNode<T> t = this.Next;
            this.Next = node;
            node.Next = t;
        }

        public LinkedListNode(T value)
        {
            this.Value = value;
        }

        public override string ToString()
        {
            return Value.ToString();
        }
    }
}

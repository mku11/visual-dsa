using System;
using System.Collections.Generic;

// UI settings
// Expression: linkedList
//   Type: LinkedListCustom<string>
//     Layout: Linked List
//     Nodes: Head
//     Save: Object Type Attributes
//   Type: LinkedListNode<string>
//     Layout: Linked List
//     Nodes: Next
//     Properties: Value
//     Save: Object Type Attributes

// Expression: linkedList2
//   Type: System.Collections.Generic.LinkedList<string>
//     Layout: Linked List
//     Save: Object Type Attributes
//   Type: string
//     Layout: Linked List
//     Properties: value
//     Save: Object Type Attributes
internal class LinkedLists
{

    public static void RunMain(string[] args)
    {
        new LinkedLists().Start();
    }

    public void Start()
    {
        // custom linkedlist
        LinkedListCustom<string> linkedList = new LinkedListCustom<string>();
        linkedList.Append("1");
        linkedList.Append("2");
        linkedList.Append("3");
        linkedList.Append("4");

        LinkedListNode<string> head = linkedList.Head;
        while (head != null)
        {
            if (head.Value.Equals("3"))
            {
                head.insertNext(new LinkedListNode<string>("5"));
                break;
            }
            head = head.Next;
        }

        // .NET linked list
        LinkedList<string> linkedList2 = new LinkedList<string>();
        linkedList2.AddLast("1");
        linkedList2.AddLast("2");
        linkedList2.AddLast("3");
        linkedList2.AddLast("4");

        Console.WriteLine("done");
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


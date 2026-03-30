using System;
using System.Collections.Generic;

public class DoublyLinkedLists
{

    public static void RunMain(string[] args)
    {
        new DoublyLinkedLists().Start();
    }

    public void Start()
    {
        // custom linkedlist
        DoublyLinkedList<string> linkedList = new DoublyLinkedList<string>();
        for (int i = 0; i < 7; i++)
        {
            linkedList.Append(i.ToString());
        }

        Node<string> node = linkedList.Head;
        while (node != null)
        {
            Console.WriteLine(node.Value);
            if (node.Value.Equals("5"))
            {
                node.InsertNext(new Node<string>("50"));
                break;
            }
            node = node.Next;
        }
    }

    class DoublyLinkedList<T>
    {

        public Node<T> Head { get; private set; }
        public Node<T> Tail { get; private set; }

        public void Append(T value)
        {
            if (Head == null)
            {
                Head = new Node<T>(value);
                Tail = Head;
            }
            else
            {
                Tail.InsertNext(new Node<T>(value));
                Tail = Tail.Next;
            }
        }
    }

    private class Node<T>
    {

        public T Value { get; private set; }
        public Node<T> Next { get; private set; }
        public Node<T> Prev { get; private set; }

        public Node(T value)
        {
            this.Value = value;
        }

        public void InsertNext(Node<T> node)
        {
            Node<T> t = this.Next;
            this.Next = node;
            node.Next = t;
            if (t != null)
                t.Prev = node;
            node.Prev = this;
        }

        public override string ToString()
        {
            return Value.ToString();
        }
    }

    // custom extractor
    static class Extractor
    {

        // register the custom types
        public static List<string> RegisterTypes()
        {
            return ["DoublyLinkedListCustom.DoublyLinkedListNode"];
        }

        public static string ToString(string type, Node<string> node)
        {
            return node.Value.ToString();
        }
    }
}
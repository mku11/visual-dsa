#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <string>
#include <ostream>
#include <iostream>
#include <cstdint>
#include <list>

using namespace std;

template <typename T>
class Node
{

public:
    T value;

public:
    Node<T> *next = NULL;
    Node<T> *prev = NULL;
    Node(T value)
    {
        this->value = value;
    }
    void insertNext(Node<T> *node)
    {
        Node<T> *t = this->next;
        this->next = node;
        node->next = t;
        if (t != NULL)
            t->prev = node;
        node->prev = this;
    }

    string to_string()
    {
        return value.to_string();
    }
};

template <typename T>
class DoublyLinkedList
{

public:
    Node<T> *head = NULL;
    Node<T> *tail = NULL;

    void append(T value)
    {
        if (head == NULL)
        {
            head = new Node<T>(value);
            tail = head;
        }
        else
        {
            tail->insertNext(new Node<T>(value));
            tail = tail->next;
        }
    }
};

class DoublyLinkedLists
{
public:
    void start()
    {
        // custom linkedlist
        DoublyLinkedList<string> *linkedList = new DoublyLinkedList<string>();
        for (int i = 0; i < 7; i++)
        {
            linkedList->append(to_string(i));
        }

        Node<string> *node = linkedList->head;
        while (node != NULL)
        {
            if (node->value == "5")
            {
                node->insertNext(new Node<string>("50"));
                break;
            }
            node = node->next;
        }

        cout << "done" << endl;

        // generally this is where you should be releasing
        // the allocated memory
    }
};

void main(int argc, char **argv)
{
    DoublyLinkedLists().start();
}

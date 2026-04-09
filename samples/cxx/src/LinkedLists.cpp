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
class LinkedListNode
{

public:
    T value;
    LinkedListNode<T> *next = NULL;
    void insertNext(LinkedListNode<T>* node)
    {
        LinkedListNode<T>* t = this->next;
        this->next = node;
        node->next = t;
    }
    LinkedListNode(T value)
    {
        this->value = value;
    }
    string to_string()
    {
        return Value.to_string();
    }
};

template <typename T>
class LinkedListCustom
{
public:
    LinkedListNode<T> *head;
    void append(T value)
    {
        if (head == NULL)
        {
            head = new LinkedListNode<T>(value);
        }
        else
        {
            LinkedListNode<T> *m = head;
            while (m->next != NULL)
            {
                m = m->next;
            }
            m->next = new LinkedListNode<T>(value);
        }
    }
};

class LinkedLists
{
public:
    void start()
    {
        // custom linkedlist
        LinkedListCustom<string> *linkedList = new LinkedListCustom<string>();
        linkedList->append("1");
        linkedList->append("2");
        linkedList->append("3");
        linkedList->append("4");

        LinkedListNode<string> *node = linkedList->head;
        while (node != NULL)
        {
            if (node->value == "3")
            {
                node->insertNext(new LinkedListNode<string>("5"));
                break;
            }
            node = node->next;
        }

        // std linked list
        std::list<string> *linkedList2 = new std::list<string>();
        linkedList2->push_back("1");
        linkedList2->push_back("2");
        linkedList2->push_back("3");
        linkedList2->push_back("4");

        cout << "done" << endl;
    }
};


void main(int argc, char **argv)
{
    LinkedLists().start();
}

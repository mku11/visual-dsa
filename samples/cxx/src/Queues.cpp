#include <cstdlib>
#include <cstdio>
#include <cstring>
#include <string>
#include <ostream>
#include <iostream>
#include <cstdint>
#include <queue>

using namespace std;

template <typename T, typename S>
class QueueNode
{
public:
    T value;
    S data;

    QueueNode(T value, S data)
    {
        this->value = value;
        this->data = data;
    }

    string to_string()
    {
        return this->data + ":" + this->value;
    }
};

template <typename T, typename P>
class PriorityNode
{
public:
    T value;
    P priority;

    PriorityNode(T value, P prio)
    {
        this->value = value;
        this->priority = prio;
    }

    string to_string()
    {
        return this->priority + ":" + this->value;
    }
};

class Queues
{
public:
    void start()
    {
        // queue with string
        queue<string> *q = new queue<string>();
        q->push("1");
        q->push("3");
        q->push("2");
        q->push("4");

        while (q->size() > 0)
        {
            string node = q->front();
            q->pop();
            cout << node << endl;
        }

        // queue with nodes
        queue<QueueNode<string, int> *> *qo = new queue<QueueNode<string, int> *>();
        qo->push(new QueueNode<string, int>("1", 1));
        qo->push(new QueueNode<string, int>("3", 3));
        qo->push(new QueueNode<string, int>("2", 2));
        qo->push(new QueueNode<string, int>("4", 4));

        while (qo->size() > 0)
        {
            QueueNode<string, int> *node = qo->front();
            qo->pop();
            cout << node->value << ":" << node->data << endl;
        }

        // priority queue
        auto cmp = [](PriorityNode<string, int> *a, PriorityNode<string, int> *b)
        {
            return a->priority > b->priority;
        };
        auto *pq = new priority_queue<PriorityNode<string, int> *,
                                      std::vector<PriorityNode<string, int> *>,
                                      decltype(cmp)>(cmp);

        pq->push(new PriorityNode<string, int>("1", 1));
        pq->push(new PriorityNode<string, int>("3", 3));
        pq->push(new PriorityNode<string, int>("2", 2));
        pq->push(new PriorityNode<string, int>("4", 4));

        while (pq->size() > 0)
        {
            PriorityNode<string, int> *node = pq->top();
            pq->pop();
            cout << node->to_string() << endl;
        }

        cout << "done" << endl;
    }
};

void main(int argc, char **argv)
{
    Queues().start();
}

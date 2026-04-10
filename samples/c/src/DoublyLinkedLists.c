#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <stdint.h>

typedef struct Node
{
    char *value;
    struct Node *next;
    struct Node *prev;
} Node;

void nodeInsertNext(Node *this, Node *node)
{
    Node *t = this->next;
    this->next = node;
    node->next = t;
    if (t != NULL)
        t->prev = node;
    node->prev = this;
}

char *nodeToString(Node *this)
{
    return this->value;
}

typedef struct DoublyLinkedList
{
    Node *head;
    Node *tail;
} DoublyLinkedList;

void linkedListAppend(DoublyLinkedList *this, char *value)
{
    char* str = (char*) malloc(3 * sizeof(char));
    strncpy_s(str, 3, value, 3);

    Node *newNode = (Node *)malloc(sizeof(Node));
    newNode->value = str;
    newNode->next = NULL;
    newNode->prev = NULL;

    if (this->head == NULL)
    {
        this->head = newNode;
        this->tail = this->head;
    }
    else
    {
        nodeInsertNext(this->tail, newNode);
        this->tail = this->tail->next;
    }
}

void main(int argc, char **argv)
{
    // custom linkedlist
    DoublyLinkedList *linkedList = (DoublyLinkedList *)malloc(sizeof(DoublyLinkedList));
    linkedList->head = NULL;
    linkedList->tail = NULL;

    char value[3];
    for (int i = 0; i < 7; i++)
    {
        itoa(i, value, 10);
        linkedListAppend(linkedList, value);
    }

    Node *node = linkedList->head;
    while (node != NULL)
    {
        if (!strcmp(node->value, "5"))
        {
            Node *newNode = (Node *)malloc(sizeof(Node));
            newNode->value = "50";
            newNode->next = NULL;
            newNode->prev = NULL;
            nodeInsertNext(node, newNode);
            break;
        }
        node = node->next;
    }

    printf("done\n");

    // generally this is where you should be releasing
    // the allocated memory
}

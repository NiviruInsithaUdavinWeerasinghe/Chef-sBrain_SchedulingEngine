package com.chefsbrain.scheduling_engine.service.history;

import com.chefsbrain.scheduling_engine.model.Order;

/**
 * Custom implementation of a Doubly Linked List to manage completed orders.
 */
public class CustomOrderHistory {
    private Node head;
    private Node tail;
    private int size;

    public CustomOrderHistory() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    // Add order to the end of history
    public void addLast(Order order) {
        Node newNode = new Node(order);
        if (tail == null) {
            head = tail = newNode;
        } else {
            tail.next = newNode;
            newNode.prev = tail;
            tail = newNode;
        }
        size++;
    }

    // Remove last order from history
    public Order removeLast() {
        if (tail == null) return null;
        Order removedOrder = tail.order;

        if (head == tail) {
            head = tail = null;
        } else {
            tail = tail.prev;
            tail.next = null;
        }
        size--;
        return removedOrder;
    }

    public boolean isEmpty() {
        return size == 0;
    }
}
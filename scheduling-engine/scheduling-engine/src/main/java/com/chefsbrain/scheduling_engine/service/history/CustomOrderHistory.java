package com.chefsbrain.scheduling_engine.service.history;

import com.chefsbrain.scheduling_engine.model.Order;

import java.util.ArrayList;
import java.util.List;

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

    /**
     * Traverses the DLL and returns all orders as a List.
     */
    //get all method
    public List<Order> getAll() {
        List<Order> orderList = new ArrayList<>();
        Node current = head;
        while (current != null) {
            orderList.add(current.order);
            current = current.next;
        }
        return orderList;
    }
}
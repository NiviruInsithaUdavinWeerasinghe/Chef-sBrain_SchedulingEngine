package com.chefsbrain.scheduling_engine.service.history;

import com.chefsbrain.scheduling_engine.model.Order;

/**
 * Represents a single node in the Custom Doubly Linked List for order history.
 */
public class Node {
    public Order order;
    public Node next;
    public Node prev;

    public Node(Order order) {
        this.order = order;
        this.next = null;
        this.prev = null;
    }
}
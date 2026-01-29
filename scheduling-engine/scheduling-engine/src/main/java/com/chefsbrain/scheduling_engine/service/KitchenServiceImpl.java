package com.chefsbrain.scheduling_engine.service;

import com.chefsbrain.scheduling_engine.model.Order;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.PriorityQueue;

@Service
public class KitchenServiceImpl implements KitchenService {

    // The Min-Heap: Automatically keeps the most urgent order at the top
    private final PriorityQueue<Order> minHeap = new PriorityQueue<>();

    // --- YOUR PART (Niviru) ---

    @Override
    public void addOrderToQueue(Order order) {
        // The PriorityQueue uses the Order.compareTo() method we wrote
        // to determine where this order sits in the heap.
        // VIP orders and those with immediate start times float to the top.
        minHeap.add(order);
        System.out.println("Added to Heap: " + order.getDishName() + " | Priority Rank: " + order.getCalculatedStartTime());
    }

    @Override
    public Order getNextUrgentTask() {
        // 'peek' looks at the top element (root) without removing it.
        // This is what the Chef sees as "Cook This Now".
        return minHeap.peek();
    }

    @Override
    public List<Order> getActiveQueue() {
        // PriorityQueue does NOT guarantee order when iterating or printing.
        // We must convert it to a list and sort it to show the Chef the correct list.
        List<Order> sortedList = new ArrayList<>(minHeap);
        Collections.sort(sortedList);
        return sortedList;
    }


    // --- EVAN'S PART (Placeholders) ---

    @Override
    public boolean checkAllergyConflict(Long dishId, List<String> customerAllergies) {
        // Evan will implement the HashMap logic here
        return false;
    }


    // --- SACHIN'S PART (Placeholders) ---

    @Override
    public void completeOrder(Order order) {
        // 1. Remove from Heap
        minHeap.remove(order);

        // 2. Sachin will implement the DLL "Add to History" logic here
        System.out.println("Order Completed: " + order.getDishName());
    }

    @Override
    public void undoLastCompletion() {
        // Sachin will implement the DLL "Remove from History" logic here
    }
}
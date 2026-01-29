package com.chefsbrain.scheduling_engine.service;

import com.chefsbrain.scheduling_engine.model.Order;
import java.util.List;

public interface KitchenService {

    /**
     * [cite_start]Requirement: Min-Heap [cite: 30, 31]
     * [cite_start]Adds a new order to the priority queue based on calculated start time[cite: 71].
     * (Assigned to: Niviru)
     */
    void addOrderToQueue(Order order);

    /**
     * Requirement: Prep Sync
     * [cite_start]Retrieves the next most urgent task from the top of the Min-Heap[cite: 34, 72].
     * (Assigned to: Niviru)
     */
    Order getNextUrgentTask();

    /**
     * [cite_start]Requirement: Safety Validation (Hash Map) [cite: 37, 73]
     * [cite_start]Compares customer allergy tags against dish ingredients[cite: 38, 74].
     * (Assigned to: Evan)
     */
    boolean checkAllergyConflict(Long dishId, List<String> customerAllergies);

    /**
     * [cite_start]Requirement: Doubly Linked List (DLL) [cite: 42, 44]
     * [cite_start]Moves a completed order to the History DLL[cite: 76].
     * (Assigned to: Sachin)
     */
    void completeOrder(Order order);

    /**
     * [cite_start]Requirement: History & Undo [cite: 43]
     * [cite_start]Recalls the last completed order from the DLL and moves it back to Active[cite: 46, 68].
     * (Assigned to: Sachin)
     */
    void undoLastCompletion();

    /**
     * Returns all currently active orders for the dashboard view.
     * (Assigned to: Niviru)
     */
    List<Order> getActiveQueue();
}
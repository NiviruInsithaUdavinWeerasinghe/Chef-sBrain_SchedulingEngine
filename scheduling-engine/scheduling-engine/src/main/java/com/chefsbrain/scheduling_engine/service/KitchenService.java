package com.chefsbrain.scheduling_engine.service;

import com.chefsbrain.scheduling_engine.model.Order;
import java.util.List;

public interface KitchenService {

    /**
     * Requirement: Min-Heap
     * Adds a new order to the priority queue based on calculated start time.
     * (Assigned to: Niviru)
     */
    void addOrderToQueue(Order order);

    /**
     * Requirement: Prep Sync
     * Retrieves the next most urgent task from the top of the Min-Heap.
     * (Assigned to: Niviru)
     */
    Order getNextUrgentTask();

    /**
     * Requirement: Safety Validation (Hash Map)
     * Compares customer allergy tags against dish ingredients.
     * (Assigned to: Evan)
     */
    boolean checkAllergyConflict(Long dishId, List<String> customerAllergies);

    /**
     * Requirement: Doubly Linked List (DLL)
     * Moves a completed order to the History DLL.
     * (Assigned to: Sachin)
     */
    void completeOrder(Order order);

    /**
     * Requirement: History & Undo [cite: 43]
     * Recalls the last completed order from the DLL and moves it back to Active.
     * (Assigned to: Sachin)
     */
    void undoLastCompletion();

    /**
     * Returns all currently active orders for the dashboard view.
     * (Assigned to: Niviru)
     */
    List<Order> getActiveQueue();
}
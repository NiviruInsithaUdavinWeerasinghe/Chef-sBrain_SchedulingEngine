package com.chefsbrain.scheduling_engine.service;

import com.chefsbrain.scheduling_engine.model.Order;
import java.util.List;

public interface KitchenService {

    /**
     * Requirement: Min-Heap [cite: 30, 31]
     * Adds a new order to the priority queue based on calculated start time[cite: 71].
     */
    void addOrderToQueue(Order order);

    /**
     * Requirement: Prep Sync
     * Retrieves the next most urgent task from the top of the Min-Heap[cite: 34, 72].
     */
    Order getNextUrgentTask();

    /**
     * Requirement: Safety Validation (Hash Map) [cite: 37, 73]
     * Compares customer allergy tags against dish ingredients[cite: 38, 74].
     */
    boolean checkAllergyConflict(Long dishId, List<String> customerAllergies);

    /**
     * Requirement: Doubly Linked List (DLL) [cite: 42, 44]
     * Moves a completed order to the History DLL[cite: 76].
     */
    void completeOrder(Order order);

    /**
     * Requirement: History & Undo [cite: 43]
     * Recalls the last completed order from the DLL and moves it back to Active[cite: 46, 68].
     */
    void undoLastCompletion();

    /**
     * Returns all currently active orders for the dashboard view.
     */
    List<Order> getActiveQueue();
}
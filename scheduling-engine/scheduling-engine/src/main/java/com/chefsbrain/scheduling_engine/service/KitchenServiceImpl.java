package com.chefsbrain.scheduling_engine.service;

import com.chefsbrain.scheduling_engine.model.Order;
import com.chefsbrain.scheduling_engine.repository.OrderRepository;
import org.springframework.stereotype.Service;
// --- ADD THIS IMPORT ---
import com.chefsbrain.scheduling_engine.service.history.CustomOrderHistory;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.PriorityQueue;

@Service
public class KitchenServiceImpl implements KitchenService {

    private final PriorityQueue<Order> minHeap = new PriorityQueue<>();
    private final OrderRepository orderRepository;

    // --- ADD THIS FIELD ---
    // Initialize your custom DLL
    private final CustomOrderHistory orderHistory = new CustomOrderHistory();

    public KitchenServiceImpl(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // ... (addOrderToQueue, getNextUrgentTask, getActiveQueue remain same) ...
    @Override
    public void addOrderToQueue(Order order) {
        Order savedOrder = orderRepository.save(order);
        minHeap.add(savedOrder);
    }

    @Override
    public Order getNextUrgentTask() {
        return minHeap.peek();
    }

    @Override
    public List<Order> getActiveQueue() {
        List<Order> sortedList = new ArrayList<>(minHeap);
        Collections.sort(sortedList);
        return sortedList;
    }


    // ... (checkAllergyConflict remains same) ...
    @Override
    public boolean checkAllergyConflict(Long dishId, List<String> customerAllergies) {
        return false;
    }


    // --- SACHIN'S PART (UPDATED) ---

    @Override
    public void completeOrder(Order order) {
        // 1. Remove from Heap (Active tasks)
        minHeap.remove(order);

        // 2. Add to Custom History DLL
        orderHistory.addLast(order);
        System.out.println("✅ Order moved to Custom DLL History: " + order.getDishName());
    }

    @Override
    public void undoLastCompletion() {
        // 1. Remove from History DLL
        Order lastOrder = orderHistory.removeLast();

        // 2. If an order was recalled, put it back into the Active Heap
        if (lastOrder != null) {
            minHeap.add(lastOrder);
            System.out.println("🔄 Undid completion. Order returned to Active: " + lastOrder.getDishName());
        }
    }
}
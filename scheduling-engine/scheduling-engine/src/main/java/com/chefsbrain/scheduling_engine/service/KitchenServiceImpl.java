package com.chefsbrain.scheduling_engine.service;

import com.chefsbrain.scheduling_engine.model.Order;
import com.chefsbrain.scheduling_engine.repository.DishRepository;
import com.chefsbrain.scheduling_engine.repository.OrderRepository;
import com.chefsbrain.scheduling_engine.service.KitchenService;
import com.chefsbrain.scheduling_engine.service.history.CustomOrderHistory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.PriorityQueue;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class KitchenServiceImpl implements KitchenService {

    private final Map<Long, PriorityQueue<Order>> workspaceHeaps = new ConcurrentHashMap<>();
    private final OrderRepository orderRepository;
    private final DishRepository dishRepository;
    private final Map<Long, CustomOrderHistory> workspaceHistories = new ConcurrentHashMap<>();

    public KitchenServiceImpl(OrderRepository orderRepository, DishRepository dishRepository) {
        this.orderRepository = orderRepository;
        this.dishRepository = dishRepository;
    }
    
    private PriorityQueue<Order> getHeap(Long workspaceId) {
        return workspaceHeaps.computeIfAbsent(workspaceId, k -> new PriorityQueue<>());
    }
    
    private CustomOrderHistory getHistoryObj(Long workspaceId) {
        return workspaceHistories.computeIfAbsent(workspaceId, k -> new CustomOrderHistory());
    }
    
    @Override 
    public void addOrderToQueue(Order order) {
        Order savedOrder = orderRepository.save(order);
        getHeap(savedOrder.getWorkspaceId()).add(savedOrder);
    }
    
    @Override 
    public Order getNextUrgentTask(Long workspaceId) {
        return getHeap(workspaceId).peek();
    }
    
    @Override 
    public List<Order> getActiveQueue(Long workspaceId) {
        List<Order> sortedList = new ArrayList<>(getHeap(workspaceId));
        Collections.sort(sortedList);
        return sortedList;
    }
    
    @Override 
    public boolean checkAllergyConflict(Long dishId, List<String> customerAllergies) {
        return false;
    }
    
    @Override
    public void markOrderStarted(Order incomingOrder) {
        // Find the exact object living inside the in-memory heap
        PriorityQueue<Order> heap = getHeap(incomingOrder.getWorkspaceId());
        Order orderInHeap = null;

        for (Order o : heap) {
            if (o.getId().equals(incomingOrder.getId())) {
                orderInHeap = o;
                break;
            }
        }

        // Update both the in-memory object and the database
        if (orderInHeap != null) {
            orderInHeap.setActualStartTime(LocalDateTime.now(java.time.ZoneId.of("Asia/Colombo")));
            orderRepository.save(orderInHeap);
        } else {
            // Fallback just in case
            incomingOrder.setActualStartTime(LocalDateTime.now(java.time.ZoneId.of("Asia/Colombo")));
            orderRepository.save(incomingOrder);
        }
    }

    @Override
    public void completeOrder(Order order) {
        getHeap(order.getWorkspaceId()).remove(order);
        getHistoryObj(order.getWorkspaceId()).addLast(order);

        // --- ADAPTIVE PREP TIME LEARNING ---
        if (order.getActualStartTime() != null && order.getDishId() != null) {
            long actualTimeMinutes = Duration.between(order.getActualStartTime(), LocalDateTime.now(java.time.ZoneId.of("Asia/Colombo"))).toMinutes();

            if (actualTimeMinutes > 0) {
                dishRepository.findById(order.getDishId()).ifPresent(dish -> {
                    int baseExpectedTime = dish.getPrepTimeMinutes();

                    // Quantity Scaling: 1st item = 100%, each extra item = 25% more time
                    double quantityScale = 1.0 + ((order.getQuantity() - 1) * 0.25);
                    double expectedTotalTime = baseExpectedTime * quantityScale;

                    // Outlier Rejection: Between 30% and 300% of expected time
                    if (actualTimeMinutes >= (expectedTotalTime * 0.3) && actualTimeMinutes <= (expectedTotalTime * 3.0)) {

                        // Reverse calculate the single portion time
                        double singlePortionActualTime = actualTimeMinutes / quantityScale;

                        int updatedPrepTime = (int) Math.round((baseExpectedTime * 0.9) + (singlePortionActualTime * 0.1));
                        updatedPrepTime = Math.max(1, updatedPrepTime);

                        dish.setPrepTimeMinutes(updatedPrepTime);
                        dishRepository.save(dish);

                        System.out.println("🧠 Adaptive Learning: " + dish.getName() +
                                " took " + actualTimeMinutes + "m for qty " + order.getQuantity() +
                                ". Updated expected single prep time to " + updatedPrepTime + "m.");
                    } else {
                        System.out.println("⚠️ Outlier ignored for " + dish.getName() + ": took " + actualTimeMinutes + "m");
                    }
                });
            }
        }

        System.out.println("✅ Order moved to Custom DLL History: " + order.getDishName());
    }

    @Override
    public void undoLastCompletion(Long workspaceId) {
        Order lastOrder = getHistoryObj(workspaceId).removeLast();
        if (lastOrder != null) {
            getHeap(workspaceId).add(lastOrder);
            System.out.println("🔄 Undid completion. Order returned to Active: " + lastOrder.getDishName());
        }
    }

    @Override
    public List<Order> getHistory(Long workspaceId) {
        return getHistoryObj(workspaceId).getAll();
    }
}
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
    public void completeOrder(Order order) {
        getHeap(order.getWorkspaceId()).remove(order);
        getHistoryObj(order.getWorkspaceId()).addLast(order);

        // --- ADAPTIVE PREP TIME LEARNING ---
        if (order.getOrderPlacedTime() != null && order.getDishId() != null) {
            // Calculate actual time taken in minutes
            long actualTimeMinutes = Duration.between(order.getOrderPlacedTime(), LocalDateTime.now()).toMinutes();

            // Validate the time is reasonable (ignore immediate accidental clicks)
            if (actualTimeMinutes > 0) {
                dishRepository.findById(order.getDishId()).ifPresent(dish -> {
                    // Exponential Moving Average (EMA)
                    // 70% historical weight, 30% new actual time
                    int updatedPrepTime = (int) Math.round((dish.getPrepTimeMinutes() * 0.9) + (actualTimeMinutes * 0.1));

                    // Safety check: Ensure the prep time doesn't drop below 1 minute
                    updatedPrepTime = Math.max(1, updatedPrepTime);

                    dish.setPrepTimeMinutes(updatedPrepTime);
                    dishRepository.save(dish);

                    System.out.println("🧠 Adaptive Learning: " + dish.getName() +
                            " took " + actualTimeMinutes + "m. Updated expected prep time to " + updatedPrepTime + "m.");
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
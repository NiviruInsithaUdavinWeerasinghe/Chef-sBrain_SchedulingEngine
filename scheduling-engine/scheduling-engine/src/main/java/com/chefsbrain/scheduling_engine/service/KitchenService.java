package com.chefsbrain.scheduling_engine.service;

import com.chefsbrain.scheduling_engine.model.Order;
import java.util.List;

public interface KitchenService {

    void addOrderToQueue(Order order);

    Order getNextUrgentTask(Long workspaceId);

    boolean checkAllergyConflict(Long dishId, List<String> customerAllergies);

    void completeOrder(Order order);

    void undoLastCompletion(Long workspaceId);

    List<Order> getActiveQueue(Long workspaceId);

    List<Order> getHistory(Long workspaceId);
}
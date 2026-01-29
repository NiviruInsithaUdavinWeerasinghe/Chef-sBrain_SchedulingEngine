package com.chefsbrain.scheduling_engine.controller;

import com.chefsbrain.scheduling_engine.model.Order;
import com.chefsbrain.scheduling_engine.service.KitchenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/orders") // This is the base URL for all endpoints below
@CrossOrigin(origins = "http://localhost:5173") // Allows your React Frontend to talk to this Backend
public class OrderController {

    private final KitchenService kitchenService;

    // Constructor Injection: Connects the Controller to the Service
    public OrderController(KitchenService kitchenService) {
        this.kitchenService = kitchenService;
    }

    /**
     * Endpoint: POST /api/orders
     * Action: Waiter punches in a new order.
     * Input: JSON body { "dishName": "Steak", "tableNumber": 5, "prepTimeMinutes": 20, "isVip": true }
     */
    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody Order order) {
        // 1. Set the timestamp for when the order was received
        order.setOrderPlacedTime(LocalDateTime.now());

        // 2. Calculate the "Start Time" (Logic: Order Time + Prep Time)
        // Note: In a real app, this might be "Target Serve Time" - "Prep Time".
        // For now, we simulate urgency by adding prep time to current time.
        order.setCalculatedStartTime(order.getOrderPlacedTime().plusMinutes(order.getPrepTimeMinutes()));

        // 3. Send to the "Brain" (Service Layer)
        kitchenService.addOrderToQueue(order);

        return ResponseEntity.ok(order);
    }

    /**
     * Endpoint: GET /api/orders/queue
     * [cite_start]Action: Chef looks at the dashboard screen[cite: 61].
     * Output: List of all active orders sorted by priority.
     */
    @GetMapping("/queue")
    public ResponseEntity<List<Order>> getOrderQueue() {
        return ResponseEntity.ok(kitchenService.getActiveQueue());
    }

    /**
     * Endpoint: GET /api/orders/next
     * [cite_start]Action: Chef asks "What do I cook NOW?"[cite: 72].
     * Output: The single most urgent order (Top of the Heap).
     */
    @GetMapping("/next")
    public ResponseEntity<Order> getNextUrgentTask() {
        Order nextOrder = kitchenService.getNextUrgentTask();
        if (nextOrder == null) {
            return ResponseEntity.noContent().build(); // Return 204 if queue is empty
        }
        return ResponseEntity.ok(nextOrder);
    }
}
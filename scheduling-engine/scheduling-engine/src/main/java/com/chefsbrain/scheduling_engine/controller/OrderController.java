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
     * Action: Chef looks at the dashboard screen.
     * Output: List of all active orders sorted by priority.
     */
    @GetMapping("/queue")
    public ResponseEntity<List<Order>> getOrderQueue(@org.springframework.web.bind.annotation.RequestParam Long workspaceId) {
        return ResponseEntity.ok(kitchenService.getActiveQueue(workspaceId));
    }

    /**
     * Endpoint: GET /api/orders/next
     * Action: Chef asks "What do I cook NOW?".
     * Output: The single most urgent order (Top of the Heap).
     */
    @GetMapping("/next")
    public ResponseEntity<Order> getNextUrgentTask(@org.springframework.web.bind.annotation.RequestParam Long workspaceId) {
        Order nextOrder = kitchenService.getNextUrgentTask(workspaceId);
        if (nextOrder == null) {
            return ResponseEntity.noContent().build(); // Return 204 if queue is empty
        }
        return ResponseEntity.ok(nextOrder);
    }

    // --- SACHIN'S NEW ENDPOINTS (DLL Integration) ---

    /**
     * Endpoint: POST /api/orders/complete
     * Action: Chef clicks "Done" on an order. Removes from active queue, adds to history.
     */

    @PostMapping("/complete")
    public ResponseEntity<String> completeOrder(@RequestBody Order order) {
        kitchenService.completeOrder(order);
        return ResponseEntity.ok("Order marked as complete and moved to history.");
    }

    /**
     * Endpoint: POST /api/orders/undo
     * Action: Chef accidentally completed an order. Pops it from history, puts back in active queue.
     */
    @PostMapping("/undo")
    public ResponseEntity<String> undoLastCompletion(@org.springframework.web.bind.annotation.RequestParam Long workspaceId) {
        kitchenService.undoLastCompletion(workspaceId);
        return ResponseEntity.ok("Last completion undone and moved back to active queue.");
    }

    /**
     * Endpoint: GET /api/orders/history
     * Action: Manager/Chef views the recently completed orders.
     * Output: List of completed orders from the Custom DLL.
     */
    @GetMapping("/history")
    public ResponseEntity<List<Order>> getHistory(@org.springframework.web.bind.annotation.RequestParam Long workspaceId) {
        return ResponseEntity.ok(kitchenService.getHistory(workspaceId));
    }
}
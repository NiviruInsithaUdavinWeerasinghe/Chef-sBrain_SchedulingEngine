package com.chefsbrain.scheduling_engine.controller;

import com.chefsbrain.scheduling_engine.dto.AllergyAlertDTO;  // NEW IMPORT
import com.chefsbrain.scheduling_engine.model.Dish;
import com.chefsbrain.scheduling_engine.repository.DishRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;  // NEW IMPORT for HashMap
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dishes")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5175"})
public class DishController {

    private final DishRepository dishRepository;

    public DishController(DishRepository dishRepository) {
        this.dishRepository = dishRepository;
    }

    /**
     * Endpoint: GET /api/dishes
     * Action: Frontend asks for the menu to populate the dropdown.
     */
    @GetMapping
    public ResponseEntity<List<Dish>> getAllDishes(@RequestParam Long workspaceId) {
        return ResponseEntity.ok(dishRepository.findByWorkspaceId(workspaceId));
    }

    @PostMapping("/load-dummy")
    public ResponseEntity<String> loadDummyData(@RequestParam Long workspaceId) {
        if (!dishRepository.findByWorkspaceId(workspaceId).isEmpty()) {
            return ResponseEntity.badRequest().body("Dummy data already exists for this workspace.");
        }

        dishRepository.save(new Dish(null, "Grilled Steak", 20, "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80", List.of("Meat", "Pepper"), workspaceId));
        dishRepository.save(new Dish(null, "Pad Thai", 12, "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80", List.of("Peanuts", "Eggs", "Shrimp"), workspaceId));
        dishRepository.save(new Dish(null, "Seafood Risotto", 25, "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80", List.of("Shellfish", "Dairy", "Rice"), workspaceId));
        dishRepository.save(new Dish(null, "Chicken Parmesan", 18, "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=800&q=80", List.of("Chicken", "Dairy", "Gluten"), workspaceId));
        dishRepository.save(new Dish(null, "Caesar Salad", 5, "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80", List.of("Dairy", "Nuts", "Lettuce"), workspaceId));
        dishRepository.save(new Dish(null, "Tomato Basil Soup", 8, "https://www.happyfoodstube.com/wp-content/uploads/2020/03/creamy-tomato-basil-soup-image.jpg", List.of("Tomatoes", "Garlic"), workspaceId));
        dishRepository.save(new Dish(null, "Garlic Bread", 4, "https://static01.nyt.com/images/2018/12/11/dining/as-garlic-bread/as-garlic-bread-googleFourByThree-v2.jpg", List.of("Gluten", "Dairy", "Garlic"), workspaceId));
        dishRepository.save(new Dish(null, "Chocolate Lava Cake", 15, "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80", List.of("Dairy", "Gluten", "Chocolate", "Eggs"), workspaceId));
        dishRepository.save(new Dish(null, "Tropical Fruit Platter", 6, "https://images.unsplash.com/photo-1567306301408-9b74779a11af?auto=format&fit=crop&w=800&q=80", List.of("Melon", "Berries", "Pineapple"), workspaceId));
        dishRepository.save(new Dish(null, "Vanilla Sundae", 3, "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80", List.of("Dairy", "Sugar"), workspaceId));

        return ResponseEntity.ok("Dummy menu loaded for workspace!");
    }

    // --- Admin Operations ---

    @PostMapping
    public ResponseEntity<Dish> addDish(@RequestBody Dish dish) {
        return ResponseEntity.ok(dishRepository.save(dish));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dish> updateDish(@PathVariable Long id, @RequestBody Dish updatedDish) {
        return dishRepository.findById(id).map(dish -> {
            dish.setName(updatedDish.getName());
            dish.setPrepTimeMinutes(updatedDish.getPrepTimeMinutes());
            dish.setImageUrl(updatedDish.getImageUrl());
            dish.setIngredients(updatedDish.getIngredients());
            return ResponseEntity.ok(dishRepository.save(dish));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDish(@PathVariable Long id) {
        return dishRepository.findById(id).map(dish -> {
            dishRepository.delete(dish);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/unload")
    public ResponseEntity<?> unloadMenu(@RequestParam Long workspaceId) {
        List<Dish> dishes = dishRepository.findByWorkspaceId(workspaceId);
        dishRepository.deleteAll(dishes);
        return ResponseEntity.ok(Map.of("message", "Menu unloaded successfully!"));
    }

    // ────────────────────────────────────────────────────────────────
    // NEW ENDPOINT – Allergy reporting with HASHMAP (Option B)
    // ────────────────────────────────────────────────────────────────
    @PostMapping("/allergies")
    public ResponseEntity<String> reportCustomerAllergies(
            @RequestBody AllergyAlertDTO alert,
            @RequestParam Long workspaceId) {

        // Basic validation
        if (!workspaceId.equals(alert.getWorkspaceId())) {
            return ResponseEntity.badRequest().body("Workspace ID mismatch");
        }

        if (alert.getDishId() == null) {
            return ResponseEntity.badRequest().body("dishId is required");
        }

        // Fetch the real dish from database
        Dish dish = dishRepository.findById(alert.getDishId())
                .orElseThrow(() -> new RuntimeException("Dish not found with ID: " + alert.getDishId()));

        // ────────────────────────────────────────────────
        // PROJECT REQUIREMENT: HASHMAP ALGORITHM IMPLEMENTATION
        // Using HashMap<String, String> for O(1) average-case lookup
        // of whether each ingredient is allergic for this customer
        // ────────────────────────────────────────────────
        HashMap<String, String> allergyStatusMap = new HashMap<>();

        // Populate map – normalize keys to lowercase for case-insensitive matching
        for (String allergicIng : alert.getCustomerAllergies()) {
            if (allergicIng != null && !allergicIng.trim().isEmpty()) {
                allergyStatusMap.put(allergicIng.trim().toLowerCase(), "ALLERGIC");
            }
        }

        // Build kitchen alert message
        StringBuilder kitchenAlert = new StringBuilder();
        kitchenAlert.append("=== KITCHEN ALLERGY ALERT ===\n");
        kitchenAlert.append("Dish: ").append(dish.getName())
                .append(" (ID: ").append(dish.getId()).append(")\n");
        kitchenAlert.append("Customer selected allergies:\n");

        boolean foundAnyAllergy = false;

        // Check every ingredient using HashMap lookup (O(1) average time)
        for (String ingredient : dish.getIngredients()) {
            String status = allergyStatusMap.getOrDefault(
                    ingredient.trim().toLowerCase(),
                    "SAFE"
            );

            if ("ALLERGIC".equals(status)) {
                kitchenAlert.append("  ⚠ AVOID: ").append(ingredient).append("\n");
                foundAnyAllergy = true;
            }
        }

        if (!foundAnyAllergy) {
            kitchenAlert.append("  No matching allergens found in dish ingredients.\n");
        }

        kitchenAlert.append("==============================");

        // ── In real app: send via WebSocket / queue / save to DB ──
        // For development / demo → print to console
        System.out.println(kitchenAlert.toString());

        // Response for frontend
        String userMessage = foundAnyAllergy
                ? "Allergy alert sent to kitchen – your safety is our priority!"
                : "No allergy conflict detected for this dish.";

        return ResponseEntity.ok(userMessage);
    }
}
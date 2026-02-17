package com.chefsbrain.scheduling_engine.controller;

import com.chefsbrain.scheduling_engine.model.Dish;
import com.chefsbrain.scheduling_engine.repository.DishRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dishes")
@CrossOrigin(origins = "http://localhost:5173")
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
    public ResponseEntity<List<Dish>> getAllDishes(@org.springframework.web.bind.annotation.RequestParam Long workspaceId) {
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
}

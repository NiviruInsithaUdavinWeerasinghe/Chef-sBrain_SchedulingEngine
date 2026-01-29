package com.chefsbrain.scheduling_engine.config;

import com.chefsbrain.scheduling_engine.model.Dish;
import com.chefsbrain.scheduling_engine.repository.DishRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(DishRepository repository) {
        return args -> {
            // --- MAIN COURSES (Long Prep Times) ---

            // Dish 1: Steak (20 mins) - High Priority Candidate
            repository.save(new Dish(
                    null,
                    "Grilled Steak",
                    20,
                    "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80",
                    List.of("Meat", "Pepper")
            ));

            // Dish 2: Pad Thai (12 mins) - Common Allergen (Peanuts)
            repository.save(new Dish(
                    null,
                    "Pad Thai",
                    12,
                    "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80",
                    List.of("Peanuts", "Eggs", "Shrimp")
            ));

            // Dish 3: Seafood Risotto (25 mins) - Shellfish Risk
            repository.save(new Dish(
                    null,
                    "Seafood Risotto",
                    25,
                    "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
                    List.of("Shellfish", "Dairy", "Rice")
            ));

            // Dish 4: Chicken Parmesan (18 mins) - Gluten/Dairy
            repository.save(new Dish(
                    null,
                    "Chicken Parmesan",
                    18,
                    "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=800&q=80",
                    List.of("Chicken", "Dairy", "Gluten")
            ));

            // --- APPETIZERS & SIDES (Short Prep Times) ---

            // Dish 5: Caesar Salad (5 mins) - Timing Mismatch Example
            repository.save(new Dish(
                    null,
                    "Caesar Salad",
                    5,
                    "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80",
                    List.of("Dairy", "Nuts", "Lettuce")
            ));

            // Dish 6: Tomato Soup (8 mins) - Vegan Option
            repository.save(new Dish(
                    null,
                    "Tomato Basil Soup",
                    8,
                    "https://images.unsplash.com/photo-1547592166-23acbe3a624b?auto=format&fit=crop&w=800&q=80",
                    List.of("Tomatoes", "Garlic")
            ));

            // Dish 7: Garlic Bread (4 mins) - Fast Item
            repository.save(new Dish(
                    null,
                    "Garlic Bread",
                    4,
                    "https://images.unsplash.com/photo-1573140247632-f84660f67627?auto=format&fit=crop&w=800&q=80",
                    List.of("Gluten", "Dairy", "Garlic")
            ));

            // --- DESSERTS ---

            // Dish 8: Chocolate Lava Cake (15 mins) - Baking Time
            repository.save(new Dish(
                    null,
                    "Chocolate Lava Cake",
                    15,
                    "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80",
                    List.of("Dairy", "Gluten", "Chocolate", "Eggs")
            ));

            // Dish 9: Fruit Platter (6 mins) - Safe Option
            repository.save(new Dish(
                    null,
                    "Tropical Fruit Platter",
                    6,
                    "https://images.unsplash.com/photo-1567306301408-9b74779a11af?auto=format&fit=crop&w=800&q=80",
                    List.of("Melon", "Berries", "Pineapple")
            ));

            // Dish 10: Ice Cream Sundae (3 mins) - Very Fast
            repository.save(new Dish(
                    null,
                    "Vanilla Sundae",
                    3,
                    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80",
                    List.of("Dairy", "Sugar")
            ));

            System.out.println("✅ Expanded Test Menu (10 Items) Loaded into H2 Database!");
        };
    }
}
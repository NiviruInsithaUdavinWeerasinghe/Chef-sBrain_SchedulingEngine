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
            // Dish 1: Steak (20 mins, Meat) [cite: 24]
            repository.save(new Dish(
                    null,
                    "Grilled Steak",
                    20,
                    "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80",
                    List.of("Meat", "Pepper")
            ));

            // Dish 2: Salad (5 mins, Nuts/Dairy) [cite: 24]
            repository.save(new Dish(
                    null,
                    "Caesar Salad",
                    5,
                    "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80",
                    List.of("Dairy", "Nuts")
            ));

            // Dish 3: Pad Thai (12 mins, Peanuts) [cite: 41]
            repository.save(new Dish(
                    null,
                    "Pad Thai",
                    12,
                    "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80",
                    List.of("Peanuts", "Eggs", "Shrimp")
            ));

            System.out.println("✅ Test Menu with Images Loaded into H2 Database!");
        };
    }
}
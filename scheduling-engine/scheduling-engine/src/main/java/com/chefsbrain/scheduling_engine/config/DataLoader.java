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
            // Global dummy data generation removed.
            // Dummy data is now loaded per workspace via the DishController.
        };
    }
}
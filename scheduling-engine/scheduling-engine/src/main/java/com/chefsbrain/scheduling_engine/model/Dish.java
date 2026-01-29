package com.chefsbrain.scheduling_engine.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Dish {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // This is the "Dish ID"

    private String name;

    // Required for "Prep Sync": The standard time this dish takes
    private int prepTimeMinutes;

    private String imageUrl; // New field for the food image

    // Required for "Safety Validation": List of ingredients for allergy checking
    @ElementCollection // This tells JPA to store this list in a separate sub-table
    private List<String> ingredients;

    // Optional: Useful for the Frontend UI later
    // private String category; // e.g., "Main", "Dessert"
    // private double price;
}
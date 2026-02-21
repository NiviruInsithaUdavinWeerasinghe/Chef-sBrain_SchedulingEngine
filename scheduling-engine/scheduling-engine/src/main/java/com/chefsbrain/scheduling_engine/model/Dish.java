package com.chefsbrain.scheduling_engine.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

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
    @ElementCollection
    private List<String> ingredients;

    // --- NEW: Map for Allergy Substitutions (e.g., "Dairy" -> "Oat Milk") ---
    @ElementCollection
    @CollectionTable(name = "dish_substitutions", joinColumns = @JoinColumn(name = "dish_id"))
    @MapKeyColumn(name = "ingredient_name")
    @Column(name = "substitute_name")
    private Map<String, String> substitutions;

    private Long workspaceId;
    // Optional: Useful for the Frontend UI later
    // private String category; // e.g., "Main", "Dessert"
    // private double price;
}
package com.chefsbrain.scheduling_engine.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data // Lombok: Auto-generates Getters, Setters, and toString
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "kitchen_orders") // "order" is a reserved SQL keyword, so we use a different name
public class Order implements Comparable<Order> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int tableNumber;
    private String dishName;

    // Critical for "Prep Sync": The time required to cook the dish
    private int prepTimeMinutes;

    // To handle "VIP" prioritization [cite: 32]
    private boolean isVip;

    // When the waiter punched in the order
    private LocalDateTime orderPlacedTime;

    // The calculated time the chef MUST start cooking
    // Start Time = Target Serving Time - Prep Time
    private LocalDateTime calculatedStartTime;

    // This method teaches the Min-Heap how to sort the orders
    @Override
    public int compareTo(Order other) {
        // 1. VIP Logic: If 'this' is VIP and 'other' is not, 'this' comes first (returns negative)
        if (this.isVip && !other.isVip) {
            return -1;
        } else if (!this.isVip && other.isVip) {
            return 1;
        }

        // 2. Prep Sync Logic: If VIP status is the same, prioritize the earlier Start Time
        // The order with the earliest start time floats to the top of the Heap [cite: 34]
        return this.calculatedStartTime.compareTo(other.calculatedStartTime);
    }
}
package com.chefsbrain.scheduling_engine.model;

import com.fasterxml.jackson.annotation.JsonProperty; // Import this!
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "kitchen_orders")
public class Order implements Comparable<Order> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int tableNumber;
    private String dishName;

    // Use Long so we can check ingredients later (Optional but good practice)
    private Long dishId;

    private int prepTimeMinutes;

    // FIX: This tells Jackson "The JSON key is exactly 'isVip'"
    @JsonProperty("isVip")
    private boolean isVip;

    private LocalDateTime orderPlacedTime;
    private LocalDateTime calculatedStartTime;

    @Override
    public int compareTo(Order other) {
        // VIP Logic: 'this' (VIP) comes before 'other' (Non-VIP)
        if (this.isVip && !other.isVip) {
            return -1;
        } else if (!this.isVip && other.isVip) {
            return 1;
        }
        // Prep Sync Logic
        return this.calculatedStartTime.compareTo(other.calculatedStartTime);
    }
}
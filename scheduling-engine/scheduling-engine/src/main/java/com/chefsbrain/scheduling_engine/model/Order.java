package com.chefsbrain.scheduling_engine.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    private Long dishId;

    private int prepTimeMinutes;

    private int quantity;

    @JsonProperty("isVip")
    private boolean isVip;

    private LocalDateTime orderPlacedTime;
    private LocalDateTime calculatedStartTime;

    private Long workspaceId;

    // ────────────────────────────────────────────────
    // NEW FIELD: Customer-selected allergic ingredients
    // ────────────────────────────────────────────────
    @ElementCollection
    @CollectionTable(name = "order_allergies", joinColumns = @JoinColumn(name = "order_id"))
    @Column(name = "allergen")
    private List<String> customerAllergies = new ArrayList<>();

    @Override
    public int compareTo(Order other) {
        if (this.isVip && !other.isVip) {
            return -1;
        } else if (!this.isVip && other.isVip) {
            return 1;
        }
        return this.calculatedStartTime.compareTo(other.calculatedStartTime);
    }
}
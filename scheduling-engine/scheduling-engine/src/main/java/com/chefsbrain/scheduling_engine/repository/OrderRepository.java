package com.chefsbrain.scheduling_engine.repository;

import com.chefsbrain.scheduling_engine.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    // This gives us .save(), .findById(), etc. for Orders automatically!
}
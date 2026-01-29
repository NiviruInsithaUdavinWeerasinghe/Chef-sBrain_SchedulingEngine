package com.chefsbrain.scheduling_engine.repository;

import com.chefsbrain.scheduling_engine.model.Dish;
import org.springframework.data.jpa.repository.JpaRepository;

// This interface gives us instant access to methods like .save(), .findAll(), etc.
public interface DishRepository extends JpaRepository<Dish, Long> {
}
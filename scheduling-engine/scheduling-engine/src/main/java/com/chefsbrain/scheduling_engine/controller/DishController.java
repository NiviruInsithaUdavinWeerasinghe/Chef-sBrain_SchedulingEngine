package com.chefsbrain.scheduling_engine.controller;

import com.chefsbrain.scheduling_engine.model.Dish;
import com.chefsbrain.scheduling_engine.repository.DishRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dishes")
@CrossOrigin(origins = "http://localhost:5173")
public class DishController {

    private final DishRepository dishRepository;

    public DishController(DishRepository dishRepository) {
        this.dishRepository = dishRepository;
    }

    /**
     * Endpoint: GET /api/dishes
     * Action: Frontend asks for the menu to populate the dropdown.
     */
    @GetMapping
    public ResponseEntity<List<Dish>> getAllDishes() {
        return ResponseEntity.ok(dishRepository.findAll());
    }
}
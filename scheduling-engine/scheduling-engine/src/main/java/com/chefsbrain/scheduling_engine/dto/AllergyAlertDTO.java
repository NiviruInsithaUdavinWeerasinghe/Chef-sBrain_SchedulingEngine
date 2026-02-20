package com.chefsbrain.scheduling_engine.dto;

import java.util.List;

public class AllergyAlertDTO {

    private Long dishId;
    private String dishName;
    private Long workspaceId;
    private List<String> customerAllergies;

    // Default constructor (required for JSON → object mapping)
    public AllergyAlertDTO() {
    }

    // Getters and setters
    public Long getDishId() {
        return dishId;
    }

    public void setDishId(Long dishId) {
        this.dishId = dishId;
    }

    public String getDishName() {
        return dishName;
    }

    public void setDishName(String dishName) {
        this.dishName = dishName;
    }

    public Long getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(Long workspaceId) {
        this.workspaceId = workspaceId;
    }

    public List<String> getCustomerAllergies() {
        return customerAllergies;
    }

    public void setCustomerAllergies(List<String> customerAllergies) {
        this.customerAllergies = customerAllergies;
    }
}
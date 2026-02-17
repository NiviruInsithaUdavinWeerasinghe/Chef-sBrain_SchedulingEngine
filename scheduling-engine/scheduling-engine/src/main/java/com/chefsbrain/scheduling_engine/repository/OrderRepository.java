package com.chefsbrain.scheduling_engine.repository;

import com.chefsbrain.scheduling_engine.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByWorkspaceId(Long workspaceId);
}
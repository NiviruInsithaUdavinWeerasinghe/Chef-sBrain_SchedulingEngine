package com.chefsbrain.scheduling_engine.repository;

import com.chefsbrain.scheduling_engine.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
}
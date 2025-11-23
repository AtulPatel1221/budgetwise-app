package com.budgetwise.budgetwise.repository;

import com.budgetwise.budgetwise.entity.Goal;
import com.budgetwise.budgetwise.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserUsername(String username);
    
    // NEW → required for PDF/CSV report
    List<Goal> findByUser(User user);
}

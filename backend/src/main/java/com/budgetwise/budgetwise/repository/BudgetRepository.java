package com.budgetwise.budgetwise.repository;

import com.budgetwise.budgetwise.entity.Budget;
import com.budgetwise.budgetwise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserUsername(String username);
    
 // NEW → required for PDF/CSV report
    List<Budget> findByUser(User user);
}

package com.budgetwise.budgetwise.repository;

import com.budgetwise.budgetwise.entity.Transaction;
import com.budgetwise.budgetwise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

//Interacts with MySQL via JPA
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserUsername(String username);
    
    // ✅ For ReportController (PDF/CSV Export)
    List<Transaction> findByUser(User user);
}


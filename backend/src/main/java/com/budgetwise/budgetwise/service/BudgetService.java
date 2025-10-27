package com.budgetwise.budgetwise.service;

import com.budgetwise.budgetwise.entity.Budget;
import com.budgetwise.budgetwise.entity.Transaction;
import com.budgetwise.budgetwise.entity.User;
import com.budgetwise.budgetwise.repository.BudgetRepository;
import com.budgetwise.budgetwise.repository.TransactionRepository;
import com.budgetwise.budgetwise.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Month;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepo;
    private final UserRepository userRepo;
    private final TransactionRepository txRepo;

    public BudgetService(BudgetRepository budgetRepo, UserRepository userRepo, TransactionRepository txRepo) {
        this.budgetRepo = budgetRepo;
        this.userRepo = userRepo;
        this.txRepo = txRepo;
    }

    // 🟢 When adding a new budget
    public Budget addBudget(Budget budget, String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        budget.setUser(user);

        // Calculate spent based on existing transactions
        double totalSpent = calculateSpent(budget.getCategory(), budget.getMonth(), username);
        budget.setSpentAmount(totalSpent);

        return budgetRepo.save(budget);
    }

    // 🟢 When getting all budgets
    public List<Budget> getBudgets(String username) {
        List<Budget> budgets = budgetRepo.findByUserUsername(username);
        for (Budget b : budgets) {
            double totalSpent = calculateSpent(b.getCategory(), b.getMonth(), username);
            b.setSpentAmount(totalSpent);
        }
        return budgets;
    }

    // 🟢 Helper: calculate total spent
    private double calculateSpent(String category, String month, String username) {
        List<Transaction> userTx = txRepo.findByUserUsername(username);

        return userTx.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .filter(t -> t.getCategory().equalsIgnoreCase(category))
                .filter(t -> {
                    if (t.getDate() == null) return false;
                    String txMonth = Month.of(t.getDate().getMonthValue()).name(); // "OCTOBER"
                    return txMonth.equalsIgnoreCase(month); // matches case-insensitive
                })
                .mapToDouble(Transaction::getAmount)
                .sum();
    }

    public void deleteBudget(Long id) {
        budgetRepo.deleteById(id);
    }
}

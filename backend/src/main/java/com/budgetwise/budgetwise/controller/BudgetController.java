package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.entity.Budget;
import com.budgetwise.budgetwise.service.BudgetService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/budgets")
public class BudgetController {
    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @PostMapping
    public Budget add(@RequestBody Budget budget, Authentication auth) {
        return service.addBudget(budget, auth.getName());
    }

    @GetMapping
    public List<Budget> all(Authentication auth) {
        return service.getBudgets(auth.getName());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteBudget(id);
    }
}

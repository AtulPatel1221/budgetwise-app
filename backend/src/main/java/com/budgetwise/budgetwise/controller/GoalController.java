package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.entity.Goal;
import com.budgetwise.budgetwise.service.GoalService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/goals")
public class GoalController {
    private final GoalService service;

    public GoalController(GoalService service) {
        this.service = service;
    }

    @PostMapping
    public Goal add(@RequestBody Goal goal, Authentication auth) {
        return service.addGoal(goal, auth.getName());
    }

    @GetMapping
    public List<Goal> all(Authentication auth) {
        return service.getGoals(auth.getName());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteGoal(id);
    }
}

package com.budgetwise.budgetwise.service;

import com.budgetwise.budgetwise.entity.Goal;
import com.budgetwise.budgetwise.entity.User;
import com.budgetwise.budgetwise.repository.GoalRepository;
import com.budgetwise.budgetwise.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GoalService {
    private final GoalRepository goalRepo;
    private final UserRepository userRepo;

    public GoalService(GoalRepository goalRepo, UserRepository userRepo) {
        this.goalRepo = goalRepo;
        this.userRepo = userRepo;
    }

    public Goal addGoal(Goal goal, String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        goal.setUser(user);
        return goalRepo.save(goal);
    }

    public List<Goal> getGoals(String username) {
        return goalRepo.findByUserUsername(username);
    }

    public void deleteGoal(Long id) {
        goalRepo.deleteById(id);
    }
}

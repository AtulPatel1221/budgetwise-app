package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.entity.User;
import com.budgetwise.budgetwise.repository.UserRepository;
import com.budgetwise.budgetwise.repository.TransactionRepository;
import com.budgetwise.budgetwise.entity.Transaction;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserRepository userRepo;
    private final TransactionRepository txRepo;

    public AdminController(UserRepository userRepo, TransactionRepository txRepo) {
        this.userRepo = userRepo;
        this.txRepo = txRepo;
    }

    // ⭐ 1. Get all users
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    // ⭐ 2. Ban user
    @PutMapping("/ban/{userId}")
    public Map<String, String> banUser(@PathVariable Long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        user.setRole(com.budgetwise.budgetwise.entity.Role.BANNED);
        userRepo.save(user);
        return Map.of("message", "User banned successfully");
    }

    // ⭐ 3. Unban user
    @PutMapping("/unban/{userId}")
    public Map<String, String> unbanUser(@PathVariable Long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        user.setRole(com.budgetwise.budgetwise.entity.Role.USER);
        userRepo.save(user);
        return Map.of("message", "User unbanned successfully");
    }

    // ⭐ 4. View user transactions
    @GetMapping("/transactions/{username}")
    public List<Transaction> getUserTransactions(@PathVariable String username) {
        return txRepo.findByUserUsername(username);
    }
}

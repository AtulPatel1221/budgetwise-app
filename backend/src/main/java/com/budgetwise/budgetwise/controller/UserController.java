package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.entity.User;
import com.budgetwise.budgetwise.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository repo;

    public UserController(UserRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/profile")
    public User getProfile(Authentication auth) {
        String username = auth.getName();
        return repo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
    }
}

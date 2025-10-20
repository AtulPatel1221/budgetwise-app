package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.entity.User;
import com.budgetwise.budgetwise.repository.UserRepository;
import com.budgetwise.budgetwise.service.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    public AuthController(UserRepository repo, PasswordEncoder encoder, JwtUtil jwtUtil, AuthenticationManager authManager) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
        this.authManager = authManager;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (repo.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists!"));
        }

        user.setPassword(encoder.encode(user.getPassword()));
        if (user.getRole() == null) user.setRole(com.budgetwise.budgetwise.entity.Role.USER);
        repo.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));

            User dbUser = repo.findByUsername(user.getUsername()).orElseThrow();
            String token = jwtUtil.generateToken(dbUser.getUsername(), dbUser.getRole().name());

            Map<String, Object> res = new HashMap<>();
            res.put("token", token);
            res.put("username", dbUser.getUsername());
            res.put("role", dbUser.getRole().name());
            return ResponseEntity.ok(res);
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password!"));
        }
    }
}

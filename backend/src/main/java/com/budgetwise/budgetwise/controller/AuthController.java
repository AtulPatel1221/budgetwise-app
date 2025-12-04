package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.entity.Role;
import com.budgetwise.budgetwise.entity.User;
import com.budgetwise.budgetwise.repository.UserRepository;
import com.budgetwise.budgetwise.service.JwtUtil;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    public AuthController(UserRepository repo,
                          PasswordEncoder encoder,
                          JwtUtil jwtUtil,
                          AuthenticationManager authManager) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
        this.authManager = authManager;
    }

    // ================= SIGNUP =================
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {

        if (user.getUsername() == null || user.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
        }

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        if (repo.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }

        if (repo.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        user.setPassword(encoder.encode(user.getPassword()));
        user.setRole(user.getRole() == null ? Role.USER : user.getRole());

        repo.save(user);

        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }


    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {

        String username = body.get("username");
        String password = body.get("password");

        if (username == null || username.isBlank() || 
            password == null || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Username and password are required"));
        }

        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            User dbUser = repo.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (dbUser.getRole() == Role.BANNED) {
                return ResponseEntity.status(403)
                        .body(Map.of("error", "Your account has been banned by admin"));
            }

            String token = jwtUtil.generateToken(
                    dbUser.getUsername(),
                    dbUser.getRole().name()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", dbUser.getUsername());
            response.put("role", dbUser.getRole().name());

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid username or password"));
        }
    }


 // ================= CHANGE PASSWORD =================
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> req) {

        String oldPassword = req.get("oldPassword");
        String newPassword = req.get("newPassword");
        String confirmPassword = req.get("confirmPassword");

        if (oldPassword == null || newPassword == null || confirmPassword == null ||
            oldPassword.isBlank() || newPassword.isBlank() || confirmPassword.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "All fields are required"));
        }

        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "New passwords do not match"));
        }

        // Extract username from JWT token
        String username = jwtUtil.extractUsernameFromCurrentRequest();

        User user = repo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check old password
        if (!encoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.status(400)
                    .body(Map.of("error", "Old password is incorrect"));
        }

        // Prevent same password
        if (encoder.matches(newPassword, user.getPassword())) {
            return ResponseEntity.status(400)
                    .body(Map.of("error", "New password cannot be same as old password"));
        }

        // Save new password
        user.setPassword(encoder.encode(newPassword));
        repo.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

}

package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.entity.PasswordResetToken;
import com.budgetwise.budgetwise.entity.User;
import com.budgetwise.budgetwise.repository.PasswordResetTokenRepository;
import com.budgetwise.budgetwise.repository.UserRepository;
import com.budgetwise.budgetwise.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class PasswordResetController {

    private final UserRepository userRepo;
    private final PasswordResetTokenRepository tokenRepo;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    public PasswordResetController(UserRepository userRepo,
                                   PasswordResetTokenRepository tokenRepo,
                                   EmailService emailService,
                                   PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    // ------------------------------
    // 1️⃣ SEND RESET LINK
    // ------------------------------
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }

        Optional<User> optional = userRepo.findByEmail(email);

        // Security best practice (always respond same)
        if (optional.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "If that email is registered, a reset link has been sent."));
        }

        User user = optional.get();

        // Delete previous tokens
        tokenRepo.deleteByUserId(user.getId());

        // Generate new token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(1);

        PasswordResetToken prt = new PasswordResetToken(token, user, expiresAt);
        tokenRepo.save(prt);

        // Full working URL
        String resetLink = frontendBaseUrl + "/reset-password?token=" + token;

        // -------------------------------------------------------------------
        // HTML EMAIL (Gmail will NOT break the link)
        // -------------------------------------------------------------------
        String html =
                "<div style=\"font-family:Arial; font-size:15px; color:#333;\">" +
                        "<h2>Hi " + user.getUsername() + ",</h2>" +
                        "<p>You requested to reset your BudgetWise password.</p>" +
                        "<p>Click the button below (valid for 1 hour):</p>" +

                        "<a href=\"" + resetLink + "\" " +
                        "style=\"display:inline-block; padding:10px 20px; " +
                        "background:#4F46E5; color:white; text-decoration:none; " +
                        "border-radius:8px; font-weight:bold;\">Reset Password</a>" +

                        "<p style=\"margin-top:20px;\">Or copy/paste this link:</p>" +
                        "<p><a href=\"" + resetLink + "\">" + resetLink + "</a></p>" +

                        "<br><p>If you didn't request this, ignore this email.</p>" +
                        "<p>— BudgetWise Team</p>" +
                "</div>";

        try {
            emailService.sendHtmlEmail(user.getEmail(), "BudgetWise — Password Reset Request", html);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Could not send reset email."));
        }

        return ResponseEntity.ok(Map.of("message", "If that email is registered, a reset link has been sent."));
    }


    // ------------------------------
    // 2️⃣ RESET PASSWORD
    // ------------------------------
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {

        String token = body.get("token");
        String newPassword = body.get("newPassword");

        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token and password are required"));
        }

        Optional<PasswordResetToken> optional = tokenRepo.findByToken(token);

        if (optional.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));
        }

        PasswordResetToken prt = optional.get();

        // Check expiry
        if (prt.getExpiresAt().isBefore(LocalDateTime.now())) {
            tokenRepo.delete(prt);
            return ResponseEntity.badRequest().body(Map.of("error", "Token expired"));
        }

        // Update password
        User user = prt.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        // Remove used token
        tokenRepo.delete(prt);

        return ResponseEntity.ok(Map.of("message", "Password has been reset. You can now login."));
    }
}

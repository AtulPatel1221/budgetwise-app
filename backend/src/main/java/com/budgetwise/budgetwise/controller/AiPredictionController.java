package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.service.AiPredictionService;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiPredictionController {

    private final AiPredictionService aiService;

    public AiPredictionController(AiPredictionService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/predict-expenses")
    public Object getPrediction(Principal principal) {
        return aiService.predictExpenses(principal.getName());
    }
}

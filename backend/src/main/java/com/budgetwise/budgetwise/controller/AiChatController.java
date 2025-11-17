package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.service.AiChatService;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class AiChatController {

    private final AiChatService aiService;

    public AiChatController(AiChatService aiService) {
        this.aiService = aiService;
    }

    @PostMapping
    public Map<String, String> chat(@RequestBody Map<String, String> body, Principal principal) {
        String userMsg = body.get("message");

        String reply = aiService.getResponse(principal.getName(), userMsg);

        return Map.of("response", reply);
    }
}

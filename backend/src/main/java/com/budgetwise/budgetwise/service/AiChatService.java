package com.budgetwise.budgetwise.service;

import com.budgetwise.budgetwise.entity.Transaction;
import com.budgetwise.budgetwise.repository.TransactionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiChatService {

    private final TransactionRepository txRepo;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${openrouter.api.key:}")
    private String openRouterApiKey;

    @Value("${openrouter.model:tngtech/tng-r1t-chimera:free}")
    private String openRouterModel;

    @Value("${openrouter.retry.max:3}")
    private int maxRetries;

    @Value("${openrouter.retry.initial-delay-ms:500}")
    private int initialDelayMs;

    public AiChatService(TransactionRepository txRepo, RestTemplate restTemplate) {
        this.txRepo = txRepo;
        this.restTemplate = restTemplate;
    }

    public Map<String, String> getResponse(String username, String userMessage) {
        String msg = userMessage == null ? "" : userMessage.toLowerCase().trim();
        List<Transaction> tx = txRepo.findByUserUsername(username);

        // 1️⃣ Greetings
        if (msg.matches("hi|hello|hey|hlo|yo|hey there")) {
            return response("BUDGETWISE_AI", "Hello! 👋 I'm your BudgetWise Assistant. How can I help?");
        }
        if (msg.contains("how are you")) {
            return response("BUDGETWISE_AI", "I'm doing great! 😊 Ready to help you manage your money smartly.");
        }

        // 2️⃣ Predict Next Month Expense
        if (msg.contains("predict") && msg.contains("expense")) {
            double result = predictNextMonthExpense(tx);
            return response("BUDGETWISE_AI",
                "📅 Next Month Prediction*\nEstimated expenses: ₹" + String.format("%.2f", result) + "**");
        }

        // 3️⃣ Highest Spending Month
        if (msg.contains("highest") && msg.contains("month")) {
            return response("BUDGETWISE_AI", highestSpendingThisMonth(tx));
        }

        // 4️⃣ Highest Spending Week
        if (msg.contains("highest") && msg.contains("week")) {
            return response("BUDGETWISE_AI", highestSpendingThisWeek(tx));
        }

        // 5️⃣ Finance Analysis
        if (msg.contains("analysis") || msg.contains("my finance") || msg.contains("my spending")) {
            return response("BUDGETWISE_AI", getPersonalAnalysis(tx));
        }

        // 6️⃣ Savings Tips
        if (msg.contains("save") || msg.contains("saving tips")) {
            return response("BUDGETWISE_AI",
                    "💡 Savings Tips\n" +
                    " Track every expense\n" +
                    " Avoid unnecessary subscriptions\n" +
                    " Limit eating outside\n" +
                    " Follow 50/30/20 budgeting rule\n" +
                    " Set monthly savings goals");
        }

        // 7️⃣ Reduce Expenses Advice
        if (msg.contains("reduce") && msg.contains("expense")) {
            return response("BUDGETWISE_AI",
                    "📉 How to Reduce Expenses\n" +
                    " Stop impulse buying\n" +
                    " Compare prices before buying\n" +
                    " Use UPI cashback offers\n" +
                    " Reduce electricity & mobile bill\n" +
                    " Track categories where you overspend");
        }

        // 8️⃣ Simple Investment Advice
        if (msg.contains("investment") || msg.contains("invest")) {
            return response("BUDGETWISE_AI",
                    "📈 Simple Investment Advice\n" +
                    " Start SIP in Index Funds\n" +
                    " Keep emergency fund for 3-6 months\n" +
                    " Avoid high-risk schemes\n" +
                    " Invest only after tracking expenses\n" +
                    " Diversify your portfolio");
        }

        // 9️⃣ Budget Creation
        if (msg.contains("budget") || msg.contains("create budget")) {
            return response("BUDGETWISE_AI",
                    "📝 Budget Creation Tip\n" +
                    "Use 50/30/20 Rule:\n" +
                    " 50% Needs\n" +
                    " 30% Wants\n" +
                    " 20% Savings\n" +
                    "I can help you track each one automatically.");
        }

        // ---------------------------
        // FALLBACK: call external model (OpenRouter)
        // ---------------------------
        Map<String, String> external = callOpenRouterModel(userMessage);
        if (external != null) {
            return external;
        }

        // final fallback if external failed
        return response("BUDGETWISE_AI", "I'm here to help with predictions, expenses, analysis, tips, budgeting and more. Ask me anything!");
    }

    private Map<String, String> response(String source, String text) {
        Map<String, String> map = new HashMap<>();
        map.put("source", source);
        map.put("response", text);
        return map;
    }

    // ---------- existing helper methods (unchanged) ----------
    private double predictNextMonthExpense(List<Transaction> tx) {
        List<Transaction> expenses = tx.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .toList();

        if (expenses.size() < 2) return 0;

        Map<YearMonth, Double> monthly = expenses.stream()
                .collect(Collectors.groupingBy(
                        t -> YearMonth.from(t.getDate()),
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        return monthly.values().stream().mapToDouble(Double::doubleValue).average().orElse(0);
    }

    private String highestSpendingThisMonth(List<Transaction> tx) {
        YearMonth now = YearMonth.now();
        return tx.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .filter(t -> YearMonth.from(t.getDate()).equals(now))
                .collect(Collectors.groupingBy(Transaction::getCategory, Collectors.summingDouble(Transaction::getAmount)))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> "📅 Highest Spending This Month: " + e.getKey() + " ₹" + e.getValue())
                .orElse("No expenses this month.");
    }

    private String highestSpendingThisWeek(List<Transaction> tx) {
        LocalDate weekStart = LocalDate.now().minusDays(7);
        return tx.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .filter(t -> !t.getDate().isBefore(weekStart))
                .collect(Collectors.groupingBy(Transaction::getCategory, Collectors.summingDouble(Transaction::getAmount)))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> "📆 Highest Weekly Expense: " + e.getKey() + " ₹" + e.getValue())
                .orElse("No expenses this week.");
    }

    private String getPersonalAnalysis(List<Transaction> tx) {
        double expense = tx.stream().filter(t -> "EXPENSE".equalsIgnoreCase(t.getType())).mapToDouble(Transaction::getAmount).sum();
        double income = tx.stream().filter(t -> "INCOME".equalsIgnoreCase(t.getType())).mapToDouble(Transaction::getAmount).sum();
        return "📊 Your Finance Summary\nIncome: ₹" + income + "\nExpense: ₹" + expense + "\nSavings: ₹" + (income - expense);
    }

    // ---------------------------
    // OpenRouter integration
    // ---------------------------
    private Map<String, String> callOpenRouterModel(String userMessage) {
        if (openRouterApiKey == null || openRouterApiKey.isBlank()) {
            // API key not configured
            return null;
        }

        String url = "https://openrouter.ai/api/v1/chat/completions";

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", openRouterModel);

        // provider preference (optional)
        Map<String, Object> provider = new HashMap<>();
        provider.put("order", Arrays.asList("OpenRouter", "Chutes"));
        payload.put("provider", provider);

        // messages
        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> m = new HashMap<>();
        m.put("role", "user");
        m.put("content", userMessage);
        messages.add(m);
        payload.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openRouterApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        int attempt = 0;
        long delay = initialDelayMs;
        while (attempt < maxRetries) {
            try {
                ResponseEntity<String> resp = restTemplate.postForEntity(url, entity, String.class);
                if (resp.getStatusCode() == HttpStatus.OK || resp.getStatusCode() == HttpStatus.CREATED) {
                    // parse response
                    JsonNode root = objectMapper.readTree(resp.getBody());
                    JsonNode choices = root.path("choices");
                    if (choices.isArray() && choices.size() > 0) {
                        JsonNode message = choices.get(0).path("message");
                        String content = message.path("content").asText(null);
                        if (content != null) {
                            return response("TNG_CHIMERA", content.trim());
                        }
                    }
                    // fallback if structure different
                    String body = root.path("output").asText(null);
                    if (body != null && !body.isEmpty()) {
                        return response("TNG_CHIMERA", body.trim());
                    }
                    return null;
                } else if (resp.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                    // rate limited, retry after delay
                    attempt++;
                    Thread.sleep(delay);
                    delay *= 2; // exponential backoff
                    continue;
                } else {
                    // other non-200
                    return null;
                }
            } catch (HttpClientErrorException.TooManyRequests ex) {
                attempt++;
                try { Thread.sleep(delay); } catch (InterruptedException ignored) {}
                delay *= 2;
            } catch (Exception ex) {
                // log and break
                ex.printStackTrace();
                return null;
            }
        }

        // if all retries failed, return null so we fallback to local message
        return null;
    }
}

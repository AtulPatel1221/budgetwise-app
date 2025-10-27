package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.entity.Transaction;
import com.budgetwise.budgetwise.repository.TransactionRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final TransactionRepository txRepo;

    public AnalyticsController(TransactionRepository txRepo) {
        this.txRepo = txRepo;
    }

    // 1️⃣ Category-wise spending summary
    @GetMapping("/category-summary")
    public Map<String, Double> getCategorySummary(Authentication auth) {
        String username = auth.getName();
        List<Transaction> transactions = txRepo.findByUserUsername(username);

        return transactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.summingDouble(Transaction::getAmount)
                ));
    }

    // 2️⃣ Monthly income vs expense
    @GetMapping("/monthly-summary")
    public List<Map<String, Object>> getMonthlySummary(Authentication auth) {
        String username = auth.getName();
        List<Transaction> transactions = txRepo.findByUserUsername(username);

        Map<String, Map<String, Double>> monthlyData = new LinkedHashMap<>();

        for (Transaction t : transactions) {
            if (t.getDate() == null) continue;
            String month = t.getDate().getMonth().name();

            monthlyData.putIfAbsent(month, new HashMap<>());
            monthlyData.get(month).putIfAbsent("income", 0.0);
            monthlyData.get(month).putIfAbsent("expense", 0.0);

            if ("INCOME".equalsIgnoreCase(t.getType())) {
                monthlyData.get(month).put("income",
                        monthlyData.get(month).get("income") + t.getAmount());
            } else {
                monthlyData.get(month).put("expense",
                        monthlyData.get(month).get("expense") + t.getAmount());
            }
        }

        // Convert to list for frontend
        List<Map<String, Object>> result = new ArrayList<>();
        monthlyData.forEach((month, map) -> {
            Map<String, Object> row = new HashMap<>();
            row.put("month", month);
            row.put("income", map.get("income"));
            row.put("expense", map.get("expense"));
            result.add(row);
        });

        return result;
    }
}

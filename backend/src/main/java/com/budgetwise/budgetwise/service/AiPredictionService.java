package com.budgetwise.budgetwise.service;

import com.budgetwise.budgetwise.entity.Transaction;
import com.budgetwise.budgetwise.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiPredictionService {

    private final TransactionRepository transactionRepo;

    public AiPredictionService(TransactionRepository transactionRepo) {
        this.transactionRepo = transactionRepo;
    }

    // ========== MAIN PREDICTION METHOD ==========
    public Map<String, Object> predictExpenses(String username) {

        // Step 1: Fetch all EXPENSE transactions by user
        List<Transaction> allTx = transactionRepo.findByUserUsername(username)
                .stream()
                .filter(t -> t.getType().equalsIgnoreCase("EXPENSE"))
                .toList();

        if (allTx.size() < 2) {
            return Map.of("error", "Not enough data to predict.");
        }

        // Step 2: Group by YearMonth
        Map<YearMonth, Double> monthlyTotals = allTx.stream()
                .collect(Collectors.groupingBy(
                        t -> YearMonth.from(t.getDate()),
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        // Step 3: Sort months correctly
        List<YearMonth> months = new ArrayList<>(monthlyTotals.keySet());
        Collections.sort(months);

        // Step 4: Convert to x,y for regression
        List<Double> x = new ArrayList<>();
        List<Double> y = new ArrayList<>();

        for (int i = 0; i < months.size(); i++) {
            x.add((double) i);
            y.add(monthlyTotals.get(months.get(i)));
        }

        // Step 5: Predict next month (Simple Linear Regression)
        double prediction = linearRegressionPredict(x, y, months.size());

        return Map.of(
                "months", months,
                "monthlyTotals", monthlyTotals,
                "nextMonthPrediction", prediction
        );
    }

    // ========== SIMPLE LINEAR REGRESSION ==========
    private double linearRegressionPredict(List<Double> x, List<Double> y, int nextX) {
        int n = x.size();

        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

        for (int i = 0; i < n; i++) {
            sumX += x.get(i);
            sumY += y.get(i);
            sumXY += x.get(i) * y.get(i);
            sumXX += x.get(i) * x.get(i);
        }

        double slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        double intercept = (sumY - slope * sumX) / n;

        return slope * nextX + intercept;
    }
}

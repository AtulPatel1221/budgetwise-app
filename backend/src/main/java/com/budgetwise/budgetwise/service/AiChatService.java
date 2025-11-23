package com.budgetwise.budgetwise.service;

import com.budgetwise.budgetwise.entity.Transaction;
import com.budgetwise.budgetwise.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiChatService {

    private final TransactionRepository txRepo;

    public AiChatService(TransactionRepository txRepo) {
        this.txRepo = txRepo;
    }

    public String getResponse(String username, String userMessage) {

        String msg = userMessage.toLowerCase().trim();

        // Load user transactions once
        List<Transaction> tx = txRepo.findByUserUsername(username);

        /* ==============================
           1. GREETING
        ===============================*/
        if (msg.matches("hi|hello|hey|hlo|yo|hey there")) {
            return "Hello! I'm your BudgetWise AI Assistant 🤖. How can I help you today?";
        }

        if (msg.contains("how are you")) {
            return "I'm doing great! Ready to help you manage your finances better 😊";
        }


        /* ==============================
           2. PREDICT NEXT MONTH EXPENSE
        ===============================*/
        if (msg.contains("predict") && msg.contains("expense")) {
            double result = predictNextMonthExpense(tx);
            return "📅 Next Month Expense Prediction:\nYour expected expense is around ₹"
                    + String.format("%.2f", result) +
                    " based on your past spending trend.";
        }


        /* ==============================
           3. HIGHEST SPENDING THIS MONTH
        ===============================*/
        if (msg.contains("highest") && msg.contains("month")) {
            return highestSpendingThisMonth(tx);
        }

        /* ==============================
           4. HIGHEST SPENDING THIS WEEK
        ===============================*/
        if (msg.contains("highest") && msg.contains("week")) {
            return highestSpendingThisWeek(tx);
        }

        /* ==============================
           5. SAVING ADVICE
        ===============================*/
        if (msg.contains("save") || msg.contains("saving")) {
            return "💡 Try the 50/30/20 rule:\n50% Needs, 30% Wants, 20% Savings.\nSmall changes every month can give big results!";
        }

        /* ==============================
           6. BUDGET ADVICE
        ===============================*/
        if (msg.contains("budget")) {
            return "📝 To create a budget:\n1️⃣ Track all expenses\n2️⃣ Categorize them\n3️⃣ Set category limits\n4️⃣ Review weekly.\nI can help based on your spending!";
        }

        /* ==============================
           7. INVESTMENT ADVICE
        ===============================*/
        if (msg.contains("invest")) {
            return "📈 Good investment options:\n Mutual Funds SIP\n Gold Bonds\n Index Funds\n Recurring Deposits\nInvest only after building an emergency fund!";
        }

        /* ==============================
           8. PERSONAL ANALYSIS
        ===============================*/
        if (msg.contains("analysis") || msg.contains("my finance") || msg.contains("my spending")) {
            return getPersonalAnalysis(tx);
        }

        /* ==============================
           9. DEFAULT RESPONSE
        ===============================*/
        return "I can help you with:\n" +
                "• Predicting future expenses 🔮\n" +
                "• Monthly & weekly spending analysis 📊\n" +
                "• Budget planning 💰\n" +
                "• Expense control tips 📉\n" +
                "• Personalized spending insights 🧠\n\n" +
                "Try asking: *“Predict my next month expense”*";
    }


    /* ==========================
       HELPING FUNCTIONS
    ==========================*/

    private double predictNextMonthExpense(List<Transaction> tx) {
        List<Transaction> expenses = tx.stream()
                .filter(t -> t.getType().equals("EXPENSE"))
                .toList();

        if (expenses.size() < 2) return 0;

        Map<YearMonth, Double> monthly = expenses.stream()
                .collect(Collectors.groupingBy(
                        t -> YearMonth.from(t.getDate()),
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        List<YearMonth> months = new ArrayList<>(monthly.keySet());
        Collections.sort(months);

        List<Double> x = new ArrayList<>();
        List<Double> y = new ArrayList<>();

        for (int i = 0; i < months.size(); i++) {
            x.add((double) i);
            y.add(monthly.get(months.get(i)));
        }

        int n = x.size();
        double sumX = x.stream().mapToDouble(Double::doubleValue).sum();
        double sumY = y.stream().mapToDouble(Double::doubleValue).sum();
        double sumXY = 0, sumXX = 0;

        for (int i = 0; i < n; i++) {
            sumXY += x.get(i) * y.get(i);
            sumXX += x.get(i) * x.get(i);
        }

        double slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        double intercept = (sumY - slope * sumX) / n;

        return slope * n + intercept;
    }


    private String highestSpendingThisMonth(List<Transaction> tx) {
        YearMonth now = YearMonth.now();

        Map<String, Double> categories = tx.stream()
                .filter(t -> t.getType().equals("EXPENSE"))
                .filter(t -> YearMonth.from(t.getDate()).equals(now))
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        if (categories.isEmpty()) return "You have no expenses recorded this month 😄";

        var max = categories.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .get();

        return "📅 This Month's Highest Spending Category:\n" + max.getKey() +
                " with ₹" + max.getValue() + " spent.";
    }


    private String highestSpendingThisWeek(List<Transaction> tx) {
        LocalDate now = LocalDate.now();
        LocalDate weekStart = now.minusDays(7);

        Map<String, Double> categories = tx.stream()
                .filter(t -> t.getType().equals("EXPENSE"))
                .filter(t -> !t.getDate().isBefore(weekStart))
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        if (categories.isEmpty()) return "You have no expenses recorded this week 🙂";

        var max = categories.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .get();

        return "📆 This Week's Highest Spending: \nCategory " + max.getKey() +
                " with ₹" + max.getValue() + " spent.";
    }


    private String getPersonalAnalysis(List<Transaction> tx) {
        double expense = tx.stream()
                .filter(t -> t.getType().equals("EXPENSE"))
                .mapToDouble(Transaction::getAmount).sum();

        double income = tx.stream()
                .filter(t -> t.getType().equals("INCOME"))
                .mapToDouble(Transaction::getAmount).sum();

        return "📊 Your Finance Summary:\n\n" +
                "💰 Total Income: ₹" + income + "\n" +
                "💸 Total Expense: ₹" + expense + "\n" +
                "💡 Savings: ₹" + (income - expense) + "\n\n" +
                "Let me know if you want category-wise breakdown!";
    }
}

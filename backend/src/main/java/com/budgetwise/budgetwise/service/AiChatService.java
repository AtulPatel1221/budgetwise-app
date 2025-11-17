package com.budgetwise.budgetwise.service;

import com.budgetwise.budgetwise.entity.Transaction;
import com.budgetwise.budgetwise.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiChatService {

    private final TransactionRepository txRepo;

    public AiChatService(TransactionRepository txRepo) {
        this.txRepo = txRepo;
    }

    // MAIN CHATBOT LOGIC
    public String getResponse(String username, String userMessage) {

        String msg = userMessage.toLowerCase();

        // 1) Greeting Responses
        if (msg.contains("hello") || msg.contains("hi")) {
            return "Hello! I'm your BudgetWise AI Assistant 🤖. How can I help you with your finances today?";
        }

        if (msg.contains("how are you")) {
            return "I'm great and ready to help you plan your money better! 😊";
        }

        // 2) Savings Formula Advice
        if (msg.contains("save") || msg.contains("saving")) {
            return "A great way to save money is using the **50/30/20 rule**:\n" +
                    "50% Needs 🏠\n30% Wants 🎉\n20% Savings 💰.\nTry this for 3 months and you will see the difference!";
        }

        // 3) Spending Control Advice
        if (msg.contains("control") || msg.contains("reduce expense")) {
            return "To reduce expenses, track your transactions weekly, stop unnecessary subscriptions, avoid impulse buying, and set daily spending limits 👍.";
        }

        // 4) Budget Making
        if (msg.contains("budget") || msg.contains("make budget")) {
            return "To create a good budget:\n" +
                    "1️⃣ List your income\n2️⃣ Track all expenses\n3️⃣ Categorize spending\n4️⃣ Set monthly limits\n5️⃣ Review weekly.\nI can help based on your data too!";
        }

        // 5) INVESTMENT Advice
        if (msg.contains("invest")) {
            return "Safe investment options:\n" +
                    "• Mutual Funds 📈\n• SIP (Systematic Investment Plans)\n" +
                    "• Gold Bonds 🪙\n• FD/RD for stable returns\nInvest only what you can hold long-term.";
        }

        // 6) PERSONALIZED FINANCIAL ANALYSIS USING USER DATA
        List<Transaction> tx = txRepo.findByUserUsername(username);

        if (msg.contains("analysis") || msg.contains("my finance") || msg.contains("my spending")) {
            double totalExpense = tx.stream()
                    .filter(t -> t.getType().equals("EXPENSE"))
                    .mapToDouble(Transaction::getAmount).sum();

            double totalIncome = tx.stream()
                    .filter(t -> t.getType().equals("INCOME"))
                    .mapToDouble(Transaction::getAmount).sum();

            String topCategory = tx.stream()
                    .filter(t -> t.getType().equals("EXPENSE"))
                    .collect(Collectors.groupingBy(Transaction::getCategory, Collectors.summingDouble(Transaction::getAmount)))
                    .entrySet()
                    .stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("No expenses yet");

            return "Here is your personalized financial analysis 📊:\n\n" +
                    "💰 Total Income: ₹" + totalIncome + "\n" +
                    "💸 Total Expense: ₹" + totalExpense + "\n" +
                    "🔥 Highest Spending Category: " + topCategory + "\n\n" +
                    "Tip: Try limiting your spending in " + topCategory + " to improve savings!";
        }

        // 7) Default fallback response
        return "I didn't fully understand that, but I can help you with:\n" +
                "• Budget planning 📝\n" +
                "• Saving techniques 💰\n" +
                "• Spending control tips 📉\n" +
                "• Investment suggestions 📊\n" +
                "• Personalized financial analysis 🔍\n\n" +
                "Try asking something like: *“How can I save more money?”*";
    }
}

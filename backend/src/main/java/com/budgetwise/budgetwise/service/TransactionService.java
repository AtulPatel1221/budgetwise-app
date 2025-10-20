package com.budgetwise.budgetwise.service;

import com.budgetwise.budgetwise.entity.Transaction;
import com.budgetwise.budgetwise.entity.User;
import com.budgetwise.budgetwise.repository.TransactionRepository;
import com.budgetwise.budgetwise.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {
    private final TransactionRepository txRepo;
    private final UserRepository userRepo;

    public TransactionService(TransactionRepository txRepo, UserRepository userRepo) {
        this.txRepo = txRepo;
        this.userRepo = userRepo;
    }

    public Transaction addTransaction(Transaction tx, String username) {
        User user = userRepo.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        tx.setUser(user);
        return txRepo.save(tx);
    }

    public List<Transaction> getTransactionsForUser(String username) {
        return txRepo.findByUserUsername(username);
    }

    public Transaction updateTransaction(Long id, Transaction updated, String username) {
        Transaction existing = txRepo.findById(id).orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!existing.getUser().getUsername().equals(username)) throw new RuntimeException("Not allowed");
        existing.setType(updated.getType());
        existing.setCategory(updated.getCategory());
        existing.setAmount(updated.getAmount());
        existing.setDescription(updated.getDescription());
        existing.setDate(updated.getDate());
        return txRepo.save(existing);
    }

    public void deleteTransaction(Long id, String username) {
        Transaction t = txRepo.findById(id).orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!t.getUser().getUsername().equals(username)) throw new RuntimeException("Not allowed");
        txRepo.deleteById(id);
    }
}

package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.entity.Transaction;
import com.budgetwise.budgetwise.service.TransactionService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @PostMapping
    public Transaction create(@RequestBody Transaction tx, Authentication auth) {
        return service.addTransaction(tx, auth.getName());
    }

    @GetMapping
    public List<TransactionDTO> list(Authentication auth) {
        List<Transaction> txs = service.getTransactionsForUser(auth.getName());
        return txs.stream().map(TransactionDTO::from).collect(Collectors.toList());
    }

    @PutMapping("/{id}")
    public Transaction update(@PathVariable Long id, @RequestBody Transaction tx, Authentication auth) {
        return service.updateTransaction(id, tx, auth.getName());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication auth) {
        service.deleteTransaction(id, auth.getName());
    }

    // DTO class to send clean JSON (avoids sending full user)
    public static class TransactionDTO {
        public Long id;
        public String type;
        public String category;
        public Double amount;
        public String description;
        public String date;
        public String username;

        public static TransactionDTO from(Transaction t) {
            TransactionDTO d = new TransactionDTO();
            d.id = t.getId();
            d.type = t.getType();
            d.category = t.getCategory();
            d.amount = t.getAmount();
            d.description = t.getDescription();
            d.date = t.getDate() != null ? t.getDate().toString() : null;
            d.username = t.getUser() != null ? t.getUser().getUsername() : null;
            return d;
        }
    }
}

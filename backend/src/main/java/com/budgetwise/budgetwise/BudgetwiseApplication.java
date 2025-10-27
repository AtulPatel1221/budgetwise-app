package com.budgetwise.budgetwise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BudgetwiseApplication {
    public static void main(String[] args) {
        SpringApplication.run(BudgetwiseApplication.class, args);
        System.out.println("Budjetwise App started...");
    }
}
package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.entity.*;
import com.budgetwise.budgetwise.repository.*;
import com.opencsv.CSVWriter;

import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Chunk;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.Principal;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    private final TransactionRepository transactionRepo;
    private final UserRepository userRepo;
    private final BudgetRepository budgetRepo;
    private final GoalRepository goalRepo;

    public ReportController(TransactionRepository transactionRepo,
                            UserRepository userRepo,
                            BudgetRepository budgetRepo,
                            GoalRepository goalRepo) {
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
        this.budgetRepo = budgetRepo;
        this.goalRepo = goalRepo;
    }

    // =========================================================================
    // 1️⃣ EXPORT PDF — FULL FINANCIAL REPORT
    // =========================================================================
    @GetMapping("/export-pdf")
    public void exportFullPDF(HttpServletResponse response, Principal principal) throws IOException {

        User user = userRepo.findByUsername(principal.getName()).orElseThrow();

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=budgetwise_full_report.pdf");

        // Fetch all user data
        List<Transaction> txs = transactionRepo.findByUserUsername(user.getUsername());
        List<Budget> budgets = budgetRepo.findByUserUsername(user.getUsername());
        List<Goal> goals = goalRepo.findByUserUsername(user.getUsername());

        Document document = new Document(PageSize.A4, 25, 25, 25, 25);
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();

        // ---------------- HEADER ----------------
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
        Paragraph title = new Paragraph("📘 BudgetWise – Full Financial Report", titleFont);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);

        document.add(new Paragraph("\nUser: " + user.getUsername()));
        document.add(new Paragraph("Email: " + user.getEmail()));
        document.add(new Paragraph("Generated On: " + new Date()));
        document.add(Chunk.NEWLINE);

        // ---------------- CATEGORY SUMMARY ----------------
        document.add(new Paragraph("📊 Category-wise Expense Breakdown", 
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));

        Map<String, Double> categoryTotals = txs.stream()
                .filter(t -> "EXPENSE".equals(t.getType()))
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        PdfPTable catTable = new PdfPTable(2);
        catTable.setWidthPercentage(100);
        addTableHeader(catTable, "Category", "Amount");

        categoryTotals.forEach((category, amount) -> {
            catTable.addCell(category);
            catTable.addCell("₹" + amount);
        });

        document.add(catTable);
        document.add(Chunk.NEWLINE);

        // ---------------- MONTHLY SUMMARY ----------------
        document.add(new Paragraph("📅 Monthly Income vs Expense", 
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));

        Map<YearMonth, Double> incomeMap = new TreeMap<>();
        Map<YearMonth, Double> expenseMap = new TreeMap<>();

        for (Transaction t : txs) {
            YearMonth ym = YearMonth.from(t.getDate());
            if (t.getType().equals("INCOME"))
                incomeMap.merge(ym, t.getAmount(), Double::sum);
            else
                expenseMap.merge(ym, t.getAmount(), Double::sum);
        }

        PdfPTable monthTable = new PdfPTable(3);
        monthTable.setWidthPercentage(100);
        addTableHeader(monthTable, "Month", "Income", "Expense");

        for (YearMonth ym : incomeMap.keySet()) {
            monthTable.addCell(ym.toString());
            monthTable.addCell("₹" + incomeMap.getOrDefault(ym, 0.0));
            monthTable.addCell("₹" + expenseMap.getOrDefault(ym, 0.0));
        }

        document.add(monthTable);
        document.add(Chunk.NEWLINE);

        // ---------------- BUDGETS ----------------
        document.add(new Paragraph("📌 Budget Allocations", 
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));

        PdfPTable budgetTable = new PdfPTable(3);
        budgetTable.setWidthPercentage(100);
        addTableHeader(budgetTable, "Category", "Limit", "Used");

        for (Budget b : budgets) {
            budgetTable.addCell(b.getCategory());
            budgetTable.addCell("₹" + b.getLimitAmount());
            budgetTable.addCell("₹" + b.getSpentAmount());
        }

        document.add(budgetTable);
        document.add(Chunk.NEWLINE);

        // ---------------- GOALS ----------------
        document.add(new Paragraph("🎯 Savings Goals Progress", 
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));

        PdfPTable goalTable = new PdfPTable(3);
        goalTable.setWidthPercentage(100);
        addTableHeader(goalTable, "Goal", "Target", "Saved");

        for (Goal g : goals) {
            goalTable.addCell(g.getGoalName());
            goalTable.addCell("₹" + g.getTargetAmount());
            goalTable.addCell("₹" + g.getSavedAmount());
        }

        document.add(goalTable);

        document.close();
    }

    // Utility method
    private void addTableHeader(PdfPTable table, String... headers) {
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, 
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
            table.addCell(cell);
        }
    }

    // =========================================================================
    // 2️⃣ EXPORT CSV — FULL DATA
    // =========================================================================
    @GetMapping("/export-csv")
    public void exportFullCSV(HttpServletResponse response, Principal principal) throws IOException {

        User user = userRepo.findByUsername(principal.getName()).orElseThrow();

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=budgetwise_full_report.csv");

        List<Transaction> txs = transactionRepo.findByUserUsername(user.getUsername());
        List<Budget> budgets = budgetRepo.findByUserUsername(user.getUsername());
        List<Goal> goals = goalRepo.findByUserUsername(user.getUsername());

        CSVWriter writer = new CSVWriter(response.getWriter());

        // TRANSACTIONS
        writer.writeNext(new String[]{"--- TRANSACTIONS ---"});
        writer.writeNext(new String[]{"Date", "Type", "Category", "Amount", "Description"});

        txs.forEach(t ->
                writer.writeNext(new String[]{
                        t.getDate().toString(),
                        t.getType(),
                        t.getCategory(),
                        String.valueOf(t.getAmount()),
                        t.getDescription() == null ? "" : t.getDescription()
                })
        );

        writer.writeNext(new String[]{""});

        // BUDGETS
        writer.writeNext(new String[]{"--- BUDGETS ---"});
        writer.writeNext(new String[]{"Category", "Limit", "Used"});

        budgets.forEach(b ->
                writer.writeNext(new String[]{
                        b.getCategory(),
                        String.valueOf(b.getLimitAmount()),
                        String.valueOf(b.getSpentAmount())
                })
        );

        writer.writeNext(new String[]{""});

        // GOALS
        writer.writeNext(new String[]{"--- GOALS ---"});
        writer.writeNext(new String[]{"Goal", "Target", "Saved"});

        goals.forEach(g ->
                writer.writeNext(new String[]{
                        g.getGoalName(),
                        String.valueOf(g.getTargetAmount()),
                        String.valueOf(g.getSavedAmount())
                })
        );

        writer.close();
    }
}

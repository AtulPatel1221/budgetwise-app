package com.budgetwise.budgetwise.controller;

import com.budgetwise.budgetwise.entity.Transaction;
import com.budgetwise.budgetwise.entity.User;
import com.budgetwise.budgetwise.repository.TransactionRepository;
import com.budgetwise.budgetwise.repository.UserRepository;
import com.opencsv.CSVWriter;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.Font; 
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

import java.awt.*;
import java.io.IOException;
import java.util.List;
import java.security.Principal;

import java.util.stream.Stream;


@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    private final TransactionRepository transactionRepo;
    private final UserRepository userRepo;

    public ReportController(TransactionRepository transactionRepo, UserRepository userRepo) {
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
    }

    // ✅ 1. Export as CSV
    @GetMapping("/export-csv")
    public void exportCSV(HttpServletResponse response, Principal principal) throws IOException {
        User user = userRepo.findByUsername(principal.getName()).orElseThrow();
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=budgetwise_report.csv");

        try (CSVWriter writer = new CSVWriter(response.getWriter())) {
            writer.writeNext(new String[]{"Date", "Type", "Category", "Amount", "Description"});

            List<Transaction> txs = transactionRepo.findByUser(user);
            for (Transaction t : txs) {
                writer.writeNext(new String[]{
                        String.valueOf(t.getDate()),
                        t.getType(),
                        t.getCategory(),
                        String.valueOf(t.getAmount()),
                        t.getDescription() != null ? t.getDescription() : ""
                });
            }
        }
    }

    // ✅ 2. Export as PDF
    @GetMapping("/export-pdf")
    public void exportPDF(HttpServletResponse response, Principal principal) throws IOException {
        User user = userRepo.findByUsername(principal.getName()).orElseThrow();

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=budgetwise_report.pdf");

        List<Transaction> txs = transactionRepo.findByUser(user);

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();

        // 🏷 Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLUE);
        Paragraph title = new Paragraph("BudgetWise Financial Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        document.add(new Paragraph("User: " + user.getUsername()));
        document.add(new Paragraph("Email: " + user.getEmail()));
        document.add(Chunk.NEWLINE);

        // 🧾 Table Header
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);
        table.setWidths(new float[]{2, 2, 2, 2, 3});

        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        Stream.of("Date", "Type", "Category", "Amount", "Description").forEach(col -> {
            PdfPCell header = new PdfPCell(new Phrase(col, headerFont));
            header.setBackgroundColor(Color.LIGHT_GRAY);
            header.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(header);
        });

        // 🧮 Table Data
        for (Transaction t : txs) {
            table.addCell(String.valueOf(t.getDate()));
            table.addCell(t.getType());
            table.addCell(t.getCategory());
            table.addCell(String.valueOf(t.getAmount()));
            table.addCell(t.getDescription() != null ? t.getDescription() : "");
        }

        document.add(table);
        document.close();
    }
}
 
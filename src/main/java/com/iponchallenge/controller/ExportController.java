package com.iponchallenge.controller;

import com.iponchallenge.entity.Expense;
import com.iponchallenge.entity.TransactionType;
import com.iponchallenge.entity.User;
import com.iponchallenge.exception.BadRequestException;
import com.iponchallenge.repository.ExpenseRepository;
import com.iponchallenge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.StringJoiner;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    @GetMapping("/csv")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            Authentication auth) {

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new BadRequestException("User not found"));

        int resolvedYear  = year  != null ? year  : LocalDate.now().getYear();
        int resolvedMonth = month != null ? month : LocalDate.now().getMonthValue();

        LocalDate start = LocalDate.of(resolvedYear, resolvedMonth, 1);
        LocalDate end   = start.withDayOfMonth(start.lengthOfMonth());

        List<Expense> expenses = expenseRepository
                .findByUserAndExpenseDateBetweenOrderByExpenseDateDescCreatedAtDesc(user, start, end);

        String csv = buildCsv(expenses);
        String filename = "ipon-export-" + resolvedYear + "-" + resolvedMonth + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.getBytes());
    }

    private String buildCsv(List<Expense> expenses) {
        StringJoiner rows = new StringJoiner("\n");
        rows.add("Date,Category,Type,Amount,Notes");

        for (Expense e : expenses) {
            String cat = e.getCategory() != null ? e.getCategory().getName() : "Uncategorized";
            String type = e.getTransactionType() == TransactionType.INCOME ? "Income" : "Expense";
            String notes = e.getNotes() != null ? "\"" + e.getNotes().replace("\"", "\"\"") + "\"" : "";
            rows.add(e.getExpenseDate() + "," + csvEscape(cat) + "," + type
                    + "," + e.getAmount().toPlainString() + "," + notes);
        }
        return rows.toString();
    }

    private String csvEscape(String val) {
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}

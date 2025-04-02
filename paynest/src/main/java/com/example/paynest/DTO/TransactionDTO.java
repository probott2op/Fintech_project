package com.example.paynest.DTO;

import com.example.paynest.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    private Long id;
    private String type;  // "DEPOSIT", "WITHDRAWAL", "TRANSFER"
    private BigDecimal amount;
    private LocalDateTime timestamp;
    private Long fromAccountId;  // For transfers
    private Long toAccountId;  // For transfers
    private Boolean approved;

    // Constructor to map from Transaction entity
    public TransactionDTO(Transaction transaction) {
        this.id = transaction.getId();
        this.type = transaction.getType().toString();
        this.amount = transaction.getAmount();
        this.timestamp = transaction.getTimestamp();
        this.approved = transaction.getApproved();

        // Handling different transaction types
        if (transaction.getType().toString().equals("TRANSFER")) {
            this.fromAccountId = transaction.getAccount() != null ? transaction.getAccount().getId() : null;
            this.toAccountId = transaction.getReceiver() != null ? transaction.getReceiver().getId() : null;
        } else {
            this.fromAccountId = transaction.getAccount() != null ? transaction.getAccount().getId() : null;
            this.toAccountId = null; // No toAccount for DEPOSIT/WITHDRAW
        }
    }
}

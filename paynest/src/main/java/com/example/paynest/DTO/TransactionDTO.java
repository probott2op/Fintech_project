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
    private Long senderId;  // For transfers
    private Long receiverId;  // For transfers
    private Boolean approved;
    private String senderAccountNumber;
    private String receiverAccountNumber;


    // Constructor to map from Transaction entity
    public TransactionDTO(Transaction transaction) {
        this.id = transaction.getId();
        this.type = transaction.getType().toString();
        this.amount = transaction.getAmount();
        this.timestamp = transaction.getTimestamp();
        this.approved = transaction.getApproved();

        // Handling different transaction types
        if (transaction.getType().toString().equals("TRANSFER")) {
            this.senderId = transaction.getAccount() != null ? transaction.getAccount().getId() : null;
            this.receiverId = transaction.getReceiver() != null ? transaction.getReceiver().getId() : null;
        } else {
            this.senderId = transaction.getAccount() != null ? transaction.getAccount().getId() : null;
            this.receiverId = null; // No toAccount for DEPOSIT/WITHDRAW
        }
    }

    public boolean isApproved() {
        return approved;
    }
}

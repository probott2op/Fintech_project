package com.example.paynest.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;  // Enum: DEPOSIT, WITHDRAW, TRANSFER

    @Column(nullable = false)
    private BigDecimal amount;


    @ManyToOne
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;//many transactions to one account linked

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Who initiated the transaction//many transactions linked to one user who initiated

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = true)
    private Account sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = true)  // Receiver can be null for withdrawals
    private Account receiver;

    // Audit Fields
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column
    private LocalDateTime deletedAt;

    @Column(nullable = false, updatable = false)
    private Long createdBy;

    @Column
    private Long updatedBy;

    private Boolean approved = false;
    private LocalDateTime timestamp;

    public Transaction(Account account, BigDecimal amount, TransactionType transactionType) {
        this.account = account;
        this.amount = amount;
        this.type = transactionType;


    }
}

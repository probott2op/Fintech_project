package com.example.paynest.DTO;

import com.example.paynest.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TransactionRequestDTO {

    private Double amount;  // Transaction amount

    private TransactionType type;  // DEPOSIT, WITHDRAW, TRANSFER

    private Long senderId;  // Sender's Account ID (For Transfers)

    private Long receiverId;  // Receiver's Account ID (For Transfers)

    private String description;  // Optional transaction details

}


package com.example.paynest.DTO;


import com.example.paynest.entity.Account;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor

public class AccountDTO {
    private Long id;
    private String accountNumber;
    private BigDecimal balance;
    private String accountType;  // "SAVINGS" or "CHECKING"
    private Long userId;// Owner of the account
    private LocalDateTime timestamp;

    public AccountDTO(Account account) {
        this.id = account.getId();
        this.accountNumber = account.getAccountNumber();
        this.userId = account.getUser().getId();
        this.balance = account.getBalance();
        this.accountType = account.getAccountType();
        this.timestamp=account.getTimestamp();
    }

    // Default constructor (required for serialization)


}


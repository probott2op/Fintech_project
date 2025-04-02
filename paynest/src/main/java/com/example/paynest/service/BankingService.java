package com.example.paynest.service;

import com.example.paynest.DTO.*;

import java.math.BigDecimal;
import java.util.List;

public interface BankingService {

    // ---- User Management ----
    UserDTO registerUser(UserDTO userDTO);
    String loginUser(LoginRequestDTO loginRequestDTO);
    UserDTO getUserById(Long userId);
    List<UserDTO> getAllUsers();

    // ---- Account Management ----
    AccountDTO createAccount(Long userId, AccountDTO accountDTO);
    AccountDTO getAccountDetails(Long accountId);
    List<AccountDTO> getUserAccounts(Long userId);

    // ---- Transaction Management ----
    TransactionDTO deposit(Long accountId, TransactionRequestDTO transactionRequest);
    TransactionDTO withdraw(Long accountId, TransactionRequestDTO transactionRequest);
    TransactionDTO transfer(Long senderId, Long receiverId, TransactionRequestDTO transactionRequest);
    List<TransactionDTO> getTransactionHistory(Long accountId);

    // ---- Parent-Child Privileges ----
    void setTransactionLimit(Long parentId, Long childId, BigDecimal amount);
    boolean approveTransaction(Long transactionId, Long parentId);
    List<TransactionDTO> getPendingTransactionsForApproval(Long parentId);

    // ---- Notification & Audit Logs ----
    List<NotificationDTO> getUserNotifications(Long userId);
    void markNotificationAsRead(Long notificationId);
    List<AuditLogDTO> getAuditLogs(Long parentId);
}


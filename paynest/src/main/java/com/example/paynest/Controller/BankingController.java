package com.example.paynest.Controller;

import com.example.paynest.DTO.*;
import com.example.paynest.service.BankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class BankingController {

    @Autowired
    private BankingService bankingService;

    // ---- 🟢 User Authentication & Management ----

    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@RequestBody UserDTO userDTO) {
        return ResponseEntity.ok(bankingService.registerUser(userDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody LoginRequestDTO loginRequestDTO) {
        return ResponseEntity.ok(bankingService.loginUser(loginRequestDTO));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long userId) {
        return ResponseEntity.ok(bankingService.getUserById(userId));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(bankingService.getAllUsers());
    }

    //edit profile new changes
    @PutMapping("/users/{userId}/profile")
    public ResponseEntity<UserDTO> updateUserProfile(@PathVariable Long userId,
                                                     @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = bankingService.updateUserProfile(userId, userDTO);
        return ResponseEntity.ok(updatedUser);
    }


    // ---- 🟢 Account Management ----

    @PostMapping("/users/{userId}/accounts")
    public ResponseEntity<AccountDTO> createAccount(@PathVariable Long userId, @RequestBody AccountDTO accountDTO) {
        return ResponseEntity.ok(bankingService.createAccount(userId, accountDTO));
    }

    @GetMapping("/accounts/{accountId}")
    public ResponseEntity<AccountDTO> getAccountDetails(@PathVariable Long accountId) {
        return ResponseEntity.ok(bankingService.getAccountDetails(accountId));
    }

    @GetMapping("/users/{userId}/accounts")
    public ResponseEntity<List<AccountDTO>> getUserAccounts(@PathVariable Long userId) {
        return ResponseEntity.ok(bankingService.getUserAccounts(userId));
    }

    // ---- 🟢 Transactions: Deposit, Withdraw, Transfer ----

    @PostMapping("/accounts/{accountId}/deposit")
    public ResponseEntity<TransactionDTO> deposit(@PathVariable Long accountId, @RequestBody TransactionRequestDTO request) {
        return ResponseEntity.ok(bankingService.deposit(accountId, request));
    }

    @PostMapping("/accounts/{accountId}/withdraw")
    public ResponseEntity<TransactionDTO> withdraw(@PathVariable Long accountId, @RequestBody TransactionRequestDTO request) {
        return ResponseEntity.ok(bankingService.withdraw(accountId, request));
    }

    @PostMapping("/accounts/transfer/{senderId}/{receiverId}")
    public ResponseEntity<TransactionDTO> transfer(@PathVariable Long senderId, @PathVariable Long receiverId,
                                                   @RequestBody TransactionRequestDTO request) {
        return ResponseEntity.ok(bankingService.transfer(senderId, receiverId, request));
    }

    @GetMapping("/accounts/{accountId}/transactions")
    public ResponseEntity<List<TransactionDTO>> getTransactionHistory(@PathVariable Long accountId) {
        return ResponseEntity.ok(bankingService.getTransactionHistory(accountId));
    }

    // ---- 🟢 Parent-Child Controls & Transaction Approval ----

    @PostMapping("/parents/{parentId}/set-limit")
    public ResponseEntity<String> setTransactionLimit(@PathVariable Long parentId,
                                                      @RequestParam Long childId,
                                                      @RequestParam BigDecimal amount) {
        bankingService.setTransactionLimit(parentId, childId, amount);
        return ResponseEntity.ok("Transaction limit set successfully.");
    }

    @GetMapping("/parents/{parentId}/pending-transactions")
    public ResponseEntity<List<TransactionDTO>> getPendingTransactions(@PathVariable Long parentId) {
        return ResponseEntity.ok(bankingService.getPendingTransactionsForApproval(parentId));
    }

    @PostMapping("/parents/{parentId}/approve-transaction")
    public ResponseEntity<String> approveTransaction(@PathVariable Long parentId, @RequestParam Long transactionId) {
        boolean approved = bankingService.approveTransaction(transactionId, parentId);
        return ResponseEntity.ok(approved ? "Transaction approved." : "Approval failed.");
    }

    // ---- 🟢 Notifications ----

    @GetMapping("/users/{userId}/notifications")
    public ResponseEntity<List<NotificationDTO>> getNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(bankingService.getUserNotifications(userId));
    }

    @PostMapping("/notifications/{notificationId}/mark-read")
    public ResponseEntity<String> markNotificationAsRead(@PathVariable Long notificationId) {
        bankingService.markNotificationAsRead(notificationId);
        return ResponseEntity.ok("Notification marked as read.");
    }

    // ---- 🟢 Audit Logs ----

    @GetMapping("/parents/{parentId}/audit-logs")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogs(@PathVariable Long parentId) {
        return ResponseEntity.ok(bankingService.getAuditLogs(parentId));
    }
}

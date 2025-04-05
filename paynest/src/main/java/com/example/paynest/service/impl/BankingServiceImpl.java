package com.example.paynest.service.impl;

import com.example.paynest.DAO.*;
import com.example.paynest.DTO.*;
import com.example.paynest.entity.*;
import com.example.paynest.service.BankingService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BankingServiceImpl implements BankingService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private AuditLogRepository auditLogRepository;
    //private final PasswordEncoder passwordEncoder;//

    // ---- User Management ----
    @Override
    public UserDTO registerUser(UserDTO userDTO) {
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(userDTO.getPassword());
        if (user.getCreatedBy() == null) {
            user.setCreatedBy(1L); // Default value (e.g., System or Admin user ID)
        }

        if (user.getUpdatedBy() == null) {
            user.setUpdatedBy(0L);
        }

        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setPhoneno(userDTO.getPhoneno());



        // Convert String to Enum
        try {
            user.setRole(Role.valueOf(userDTO.getRole().toUpperCase())); // Ensure case insensitivity
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + userDTO.getRole());
        }

        if (userDTO.getParentId() != null) {
            User parent = userRepository.findById(userDTO.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent not found"));
            user.setParent(parent);
        }

        userRepository.save(user);
        return new UserDTO(user);
    }



    @Override
    public String loginUser(LoginRequestDTO loginRequestDTO) {
        User user = userRepository.findByEmail(loginRequestDTO.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!loginRequestDTO.getPassword().equals(user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return "Login successful for user: " + user.getUsername();
    }


    @Override
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserDTO(user);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream().map(UserDTO::new).toList();
    }

    // ---- Account Management ----
    @Override
    public AccountDTO createAccount(Long userId, AccountDTO accountDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Account account = new Account();
        account.setUser(user);
        account.setAccountNumber(generateUniqueAccountNumber());
;
        account.setBalance(accountDTO.getBalance() != null ? accountDTO.getBalance() : BigDecimal.ZERO);
        account.setAccountType(accountDTO.getAccountType());
        LocalDateTime now = LocalDateTime.now();
        account.setCreatedAt(now);
        account.setUpdatedAt(now);
        account.setCreatedBy(userId);
        account.setUpdatedBy(userId);
        account.setTimestamp(now);

        accountRepository.save(account);
        return new AccountDTO(account);
    }

    @Override
    public AccountDTO getAccountDetails(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        return new AccountDTO(account);
    }

    @Override
    public List<AccountDTO> getUserAccounts(Long userId) {
        List<Account> accounts = accountRepository.findByUserId(userId);
        return accounts.stream().map(AccountDTO::new).toList();
    }

    // ---- Transaction Management ----
    @Override
    public TransactionDTO deposit(Long accountId, TransactionRequestDTO transactionRequest) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        account.setBalance(account.getBalance().add(BigDecimal.valueOf(transactionRequest.getAmount())));
        accountRepository.save(account);

        Transaction transaction = new Transaction(account, BigDecimal.valueOf(transactionRequest.getAmount()), TransactionType.Deposit);
        transactionRepository.save(transaction);

        return new TransactionDTO(transaction);
    }

    @Override
    public TransactionDTO withdraw(Long accountId, TransactionRequestDTO transactionRequest) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
      BigDecimal withdrawalAmount = BigDecimal.valueOf(transactionRequest.getAmount());

        if (account.getBalance() .compareTo(withdrawalAmount) <0) {
            throw new RuntimeException("Insufficient balance");
        }

        account.setBalance(account.getBalance() .subtract(withdrawalAmount) );
        accountRepository.save(account);

        Transaction transaction = new Transaction(account,withdrawalAmount,  TransactionType.WITHDRAW);
        transactionRepository.save(transaction);

        return new TransactionDTO(transaction);
    }

    @Override
    public TransactionDTO transfer(Long senderId, Long receiverId, TransactionRequestDTO transactionRequest) {
        Account sender = accountRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender account not found"));
        Account receiver = accountRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver account not found"));

        BigDecimal transferAmount = BigDecimal.valueOf(transactionRequest.getAmount());

        if (sender.getBalance() .compareTo(transferAmount) <0) {
            throw new RuntimeException("Insufficient funds");
        }

        sender.setBalance(sender.getBalance() .subtract(transferAmount));
        receiver.setBalance(receiver.getBalance() .add(transferAmount) );

        accountRepository.save(sender);
        accountRepository.save(receiver);


        // ✅ Create separate transactions for sender & receiver
        Transaction senderTransaction = new Transaction(sender, transferAmount, TransactionType.WITHDRAW);
        transactionRepository.save(senderTransaction);

        Transaction receiverTransaction = new Transaction(receiver, transferAmount, TransactionType.Deposit);
        transactionRepository.save(receiverTransaction);


        return new TransactionDTO(senderTransaction);
    }

    @Override
    public List<TransactionDTO> getTransactionHistory(Long accountId) {
        List<Transaction> transactions = transactionRepository.findByAccountId(accountId);
        return transactions.stream().map(TransactionDTO::new).toList();
    }

    // ---- Parent-Child Privileges ----
    public void setTransactionLimit(Long parentId, Long childId, BigDecimal amount) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));

        if (!child.getParent().equals(parent)) {
            throw new RuntimeException("Not authorized to set limit");
        }

        child.setTransactionLimit(amount);
        userRepository.save(child);
    }


    @Override
    public boolean approveTransaction(Long transactionId, Long parentId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        User child = transaction.getAccount().getUser();
        User parent = child.getParent();

        if (parent == null || !parent.getId().equals(parentId)) {
            throw new RuntimeException("Not authorized");
        }

        transaction.setApproved(true);
        transactionRepository.save(transaction);
        return true;
    }


    @Override
    public List<TransactionDTO> getPendingTransactionsForApproval(Long parentId) {
        return transactionRepository.findPendingTransactionsForParent(parentId)
                .stream()
                .map(TransactionDTO::new)
                .toList();
    }

    // ---- Notification & Audit Logs ----
    @Override
    public List<NotificationDTO> getUserNotifications(Long userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(NotificationDTO::new)
                .toList();
    }

    @Override
    public void markNotificationAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public List<AuditLogDTO> getAuditLogs(Long parentId) {
        return auditLogRepository.findByParentId(parentId)
                .stream()
                .map(AuditLogDTO::new)
                .toList();
    }

    private String generateUniqueAccountNumber() {
        String accountNumber;
        boolean isUnique = false;

        do {
            // Generate a random 10-digit number
            long randomNum = 1000000000L + (long) (Math.random() * 9000000000L);
            accountNumber = String.valueOf(randomNum);

            // Check if this account number already exists
            if (!accountRepository.existsByAccountNumber(accountNumber)) {
                isUnique = true;
            }
        } while (!isUnique);

        return accountNumber;
    }

}


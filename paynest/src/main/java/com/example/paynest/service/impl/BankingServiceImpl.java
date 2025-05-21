package com.example.paynest.service.impl;

import com.example.paynest.DAO.*;
import com.example.paynest.DTO.*;
import com.example.paynest.entity.*;
import com.example.paynest.service.BankingService;
import com.example.paynest.service.security.JWTService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JWTService jwtService;
    //private final PasswordEncoder passwordEncoder;//

    // ---- User Management ----
    @Override
    public UserDTO registerUser(UserDTO userDTO) {
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        User user = new User();
        user.setFullName(userDTO.getFullName());
        user.setEmail(userDTO.getEmail());
        final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        user.setPassword(encoder.encode(userDTO.getPassword()));

        // Generate username from full name
        String generatedUsername = generateUsername(userDTO.getFullName());
        user.setUsername(generatedUsername);

        if (user.getCreatedBy() == null) {
            user.setCreatedBy(1L); // Default value (e.g., System or Admin user ID)
        }

        if (user.getUpdatedBy() == null) {
            user.setUpdatedBy(0L);
        }

        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setPhoneno(userDTO.getPhoneno());
        user.setAddress(userDTO.getAddress());
        user.setPoi(userDTO.getPoi());




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
        User user = userRepository.findByUsername(loginRequestDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequestDTO.getUsername(), loginRequestDTO.getPassword()));
        if (authentication.isAuthenticated()) {
            return jwtService.generateToken(loginRequestDTO.getUsername(), user.getRole(), user.getId());
        }
        throw new RuntimeException("Invalid credentials");
    }


    @Override
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create the UserDTO from user entity
        UserDTO userDTO = new UserDTO(user);

        // If the user is a parent, fetch and set their children IDs
        if (user.getRole() == Role.PARENT && user.getChildren() != null) {
            List<Long> childIds = user.getChildren().stream()
                    .map(User::getId)
                    .toList();
            userDTO.setChildIds(childIds);
        }
        return userDTO;
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
                .orElseThrow(() -> new RuntimeException("Account not found" + accountId));

        User user = account.getUser();

//        account.setBalance(account.getBalance().add(BigDecimal.valueOf(transactionRequest.getAmount())));
        accountRepository.save(account);

        Transaction transaction = new Transaction(account, BigDecimal.valueOf(transactionRequest.getAmount()), TransactionType.DEPOSIT);
        transaction.setAmount(BigDecimal.valueOf(transactionRequest.getAmount()));
        transaction.setAccount(account);
        transaction.setUser(user);
        transaction.setType(TransactionType.DEPOSIT);
        transaction.setSender(account);
        transaction.setReceiver(account);//

        LocalDateTime now = LocalDateTime.now();
        transaction.setCreatedAt(now);
        transaction.setUpdatedAt(now);
        transaction.setCreatedBy(user.getId());
        transaction.setUpdatedBy(user.getId());
        transaction.setTimestamp(now);
        transaction.setApproved(true);

        account.setBalance(account.getBalance().add(BigDecimal.valueOf(transactionRequest.getAmount())));
        account.setUpdatedAt(now);
        account.setUpdatedBy(user.getId());


        Transaction savedTransaction = transactionRepository.save(transaction);
        accountRepository.save(account);


        return new TransactionDTO(savedTransaction);
    }

    @Override
    public TransactionDTO withdraw(Long accountId, TransactionRequestDTO transactionRequest) {
        // Validate the account exists
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found with ID: " + accountId));

        User user = account.getUser();

        if (user == null || user.getId() == null) {
            throw new IllegalArgumentException("User associated with the account is missing or invalid.");
        }

        // Convert Double to BigDecimal for precision
        BigDecimal withdrawAmount = BigDecimal.valueOf(transactionRequest.getAmount());

        // Ensure sufficient balance
        if (account.getBalance().compareTo(withdrawAmount) < 0) {
            throw new IllegalStateException("Insufficient funds for withdrawal.");
        }

        // Check daily transaction limit
        checkDailyTransactionLimit(user, withdrawAmount);

        // Check if approval is required (Child account exceeding limit)
        boolean needsApproval = user.getRole() == Role.CHILD &&
                (user.getTransactionLimit() == null || withdrawAmount.compareTo(user.getTransactionLimit()) > 0);

        // Create transaction record
        Transaction transaction = new Transaction(account, BigDecimal.valueOf(transactionRequest.getAmount()), TransactionType.WITHDRAW);
        transaction.setAccount(account);
        transaction.setUser(user);
        transaction.setType(TransactionType.WITHDRAW);
        transaction.setAmount(withdrawAmount);
        transaction.setSender(account);//
        transaction.setReceiver(account);//


        LocalDateTime now = LocalDateTime.now();
        transaction.setCreatedAt(now);
        transaction.setUpdatedAt(now);
        transaction.setCreatedBy(user.getId());
        transaction.setUpdatedBy(user.getId());
        transaction.setTimestamp(now);
        transaction.setApproved(!needsApproval); // Auto-approve if approval not required

        // Save the transaction
        transaction = transactionRepository.save(transaction);

        // If transaction is approved, deduct from balance
        if (!needsApproval) {
            account.setBalance(account.getBalance().subtract(withdrawAmount));
            account.setUpdatedAt(now);
            account.setUpdatedBy(user.getId());
            accountRepository.save(account);

            // Send notification to user
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setCreatedBy(user.getId());
            notification.setMessage("Withdrawal of " + withdrawAmount + " from account " + account.getAccountNumber());
            notification.setTimestamp(now);
            notification.setRead(false);
            notificationRepository.save(notification);
        } else {
            // Send approval request notification to parent
            Notification approvalNotification = new Notification();
            approvalNotification.setUser(user.getParent()); // Assuming `getParent()` method exists
            approvalNotification.setCreatedBy(user.getId());
            approvalNotification.setMessage("Child account requested withdrawal of " + withdrawAmount);
            approvalNotification.setTimestamp(now);
            approvalNotification.setRead(false);
            notificationRepository.save(approvalNotification);
        }

        // Return the DTO representation
        return new TransactionDTO(transaction);
    }
//transfer method modified

    @Override
    public TransactionDTO transfer(Long senderId, Long receiverId, TransactionRequestDTO transactionRequest) {
        // Validate accounts
        Account sender = accountRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender account not found"));
        Account receiver = accountRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver account not found"));

        User senderUser = sender.getUser();
        if (senderUser == null || senderUser.getId() == null) {
            throw new IllegalArgumentException("Sender user is missing or invalid");
        }

        // Convert amount and check balance
        BigDecimal transferAmount = BigDecimal.valueOf(transactionRequest.getAmount());
        if (sender.getBalance().compareTo(transferAmount) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        // Check daily transaction limit
        checkDailyTransactionLimit(senderUser, transferAmount);

        // Update account balances
        sender.setBalance(sender.getBalance().subtract(transferAmount));
        receiver.setBalance(receiver.getBalance().add(transferAmount));

        // Create a single transaction record for the transfer
        Transaction transaction = new Transaction();
        transaction.setType(TransactionType.TRANSFER);
        transaction.setAmount(transferAmount);
        transaction.setAccount(sender);  // Primary account association is with sender
        transaction.setUser(senderUser); // User who initiated the transfer
        transaction.setSender(sender);
        transaction.setReceiver(receiver);

        // Set audit fields
        LocalDateTime now = LocalDateTime.now();
        transaction.setCreatedAt(now);
        transaction.setUpdatedAt(now);
        transaction.setTimestamp(now);
        transaction.setCreatedBy(senderUser.getId());
        transaction.setUpdatedBy(senderUser.getId());
        transaction.setApproved(true);  // Transfers are auto-approved unless you need approval logic

        // Save all changes
        accountRepository.save(sender);
        accountRepository.save(receiver);
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Create notifications if needed
        createTransferNotifications(sender, receiver, transferAmount);

        return new TransactionDTO(savedTransaction);
    }

    // Helper method for notifications
    private void createTransferNotifications(Account sender, Account receiver, BigDecimal amount) {
        LocalDateTime now = LocalDateTime.now();

        // Notification for sender
        Notification senderNotification = new Notification();
        senderNotification.setUser(sender.getUser());
        senderNotification.setCreatedBy(sender.getUser().getId());
        senderNotification.setMessage("Transfer of " + amount + " sent to account " + receiver.getAccountNumber());
        senderNotification.setTimestamp(now);
        senderNotification.setRead(false);
        notificationRepository.save(senderNotification);

        // Notification for receiver
        Notification receiverNotification = new Notification();
        receiverNotification.setUser(receiver.getUser());
        receiverNotification.setCreatedBy(sender.getUser().getId());
        receiverNotification.setMessage("Transfer of " + amount + " received from account " + sender.getAccountNumber());
        receiverNotification.setTimestamp(now);
        receiverNotification.setRead(false);
        notificationRepository.save(receiverNotification);
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
        Notification notification = new Notification();
        notification.setUser(child);
        notification.setCreatedBy(parent.getId());
        notification.setMessage("Your transaction limit has been set to " + amount + " (applies to both per-transaction and daily totals)");
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notificationRepository.save(notification);

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

        //Process the transaction (it  update balances and process the transactions)
        Account account = transaction.getAccount();
        BigDecimal amount = transaction.getAmount();

        if (transaction.getType() == TransactionType.WITHDRAW) {
            account.setBalance(account.getBalance().subtract(amount));
            accountRepository.save(account);
        } else if (transaction.getType() == TransactionType.TRANSFER) {
            Account sender = transaction.getSender();
            Account receiver = transaction.getReceiver();

            sender.setBalance(sender.getBalance().subtract(amount));
            receiver.setBalance(receiver.getBalance().add(amount));

            accountRepository.save(sender);
            accountRepository.save(receiver);
        }

        return true; //return true if approval was successful

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

    private String generateUsername(String fullName) {
        // Remove spaces and convert to lowercase
        String baseName = fullName.replaceAll("\\s", "").toLowerCase();

        // Add a random number to ensure uniqueness
        String username = baseName + Math.round(Math.random() * 1000);

        // Check if username already exists, if so, regenerate

        return username;
    }


    //Add a helper method to check if a transaction would exceed the daily limit:
    private void checkDailyTransactionLimit(User user, BigDecimal transactionAmount) {
        if (user.getRole() == Role.CHILD && user.getTransactionLimit() != null) {
            LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(1);

            BigDecimal dailyTotal = transactionRepository.getDailyTransactionTotal(
                    user.getId(), startOfDay, endOfDay);

            // If no transactions today, dailyTotal might be null
            if (dailyTotal == null) {
                dailyTotal = BigDecimal.ZERO;
            }

            // Check if this transaction would exceed the daily limit
            if (dailyTotal.add(transactionAmount).compareTo(user.getTransactionLimit()) > 0) {
                // Create notification for child about exceeded limit
                Notification notification = new Notification();
                notification.setUser(user);
                notification.setCreatedBy(user.getId());
                notification.setMessage("Transaction declined: Daily transaction limit of " +
                        user.getTransactionLimit() + " exceeded");
                notification.setTimestamp(LocalDateTime.now());
                notification.setRead(false);
                notificationRepository.save(notification);

                throw new RuntimeException("Daily transaction limit exceeded");
            }
        }
    }


}

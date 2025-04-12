package com.example.paynest.DAO;


import com.example.paynest.entity.Account;
import com.example.paynest.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByAccountId(Long accountId);  // Fetch transactions of a specific account
    List<Transaction> findByApprovedFalseAndAccount_User_ParentId(Long parentId);
    @Query("SELECT t FROM Transaction t WHERE t.account.user.parent.id = :parentId AND t.approved = false")
    List<Transaction> findPendingTransactionsForParent(@Param("parentId") Long parentId);

    @Query("SELECT SUM(t.amount) FROM Transaction t " +
            "WHERE t.user.id = :userId " +
            "AND t.type IN ('WITHDRAW', 'TRANSFER') " +
            "AND t.approved = true " +
            "AND t.timestamp >= :startOfDay " +
            "AND t.timestamp < :endOfDay")
    BigDecimal getDailyTransactionTotal(
            @Param("userId") Long userId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );
}


//findByAccount() → Get transactions for an account.
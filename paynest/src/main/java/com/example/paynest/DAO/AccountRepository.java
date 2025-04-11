package com.example.paynest.DAO;




import com.example.paynest.entity.Account;
import com.example.paynest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {

    List<Account> findByUserId(Long userId);  // Fetch accounts for a user

    boolean existsByAccountNumber(String accountNumber);
}

//findByUserId() → Get accounts owned by a user.
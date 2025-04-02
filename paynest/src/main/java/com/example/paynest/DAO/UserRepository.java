package com.example.paynest.DAO;


import com.example.paynest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);  // For authentication

    List<User> findByParentId(Long parentId);  // Fetch child users for a parent

}


//findByEmail() → Fetch user details during login.
//
//findByParentId() → Get all child accounts under a parent.
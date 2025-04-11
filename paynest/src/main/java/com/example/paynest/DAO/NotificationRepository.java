package com.example.paynest.DAO;


import com.example.paynest.entity.Notification;
import com.example.paynest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserId(Long userId);  // Get notifications for a user

}

//findByUser() → Fetch notifications for a specific user.
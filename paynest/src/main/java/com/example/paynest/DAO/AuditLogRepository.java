package com.example.paynest.DAO;

import com.example.paynest.entity.AuditLog;
import com.example.paynest.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByParentId(Long parentId);  // Fetch logs related to a parent

   // List<AuditLog> findByChild(User child);  // Fetch logs related to a child

}

//findByParent() → Get all logs where a parent performed an action.
//
//findByChild() → Get all logs related to a child’s activity.












package com.example.paynest.DTO;

import com.example.paynest.entity.AuditLog;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Data
public class AuditLogDTO {
    private Long id;
    private String action;
    private String details;
    private LocalDateTime timestamp;
    private Long parentId;  // Who performed the action
    private Long childId;  // Affected child (if applicable)

    public AuditLogDTO(AuditLog auditLog) {
        this.id = auditLog.getId();
        this.action = auditLog.getAction();
        this.timestamp = auditLog.getTimestamp();
        this.parentId = auditLog.getParent().getId(); // Ensure parent exists
    }

}


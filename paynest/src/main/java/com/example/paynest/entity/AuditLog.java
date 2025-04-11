package com.example.paynest.entity;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Reference to Parent User who performed the action
    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    // Reference to Child User (if applicable)
    @ManyToOne
    @JoinColumn(name = "child_id")
    private User child;

    @Column(nullable = false, length = 255)
    private String action;  // Example: "Transferred funds", "Updated profile"

    @Column(length = 500)
    private String details;  // Optional field for extra information

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}


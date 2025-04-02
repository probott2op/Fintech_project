package com.example.paynest.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,unique = true)
    private String username;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column
    private String phoneno;

    private BigDecimal transactionLimit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role; //ENUM:PARENT OR CHILD

    @ManyToOne
    @JoinColumn(name = "parent_id") //for child users
    private User parent;  //multiple children linked to one parent_id

    @OneToMany(mappedBy = "parent",cascade = CascadeType.ALL)
    private List<User> children;//one parent can have multiple children

    @OneToMany(mappedBy = "user",cascade = CascadeType.ALL)
    private List<Account>accounts;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Transaction> transactions;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Notification> notifications;

    // Audit Fields
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column
    private LocalDateTime deletedAt;

    @Column(nullable = false, updatable = false)
    private Long createdBy;

    @Column
    private Long updatedBy;


    public void setTransactionLimit(BigDecimal limit) {
        this.transactionLimit = limit;
    }
}




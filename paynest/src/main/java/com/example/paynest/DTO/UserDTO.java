package com.example.paynest.DTO;


import com.example.paynest.entity.User;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor


public class UserDTO {
    private Long id;
    private String username;
    private String password;
    private String email;
    private String role;  // "PARENT" or "CHILD"
    private Long parentId;  // Null if the user is a parent
    private List<Long> childIds;// List of children for a parent
    private String phoneno;

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = (user.getRole() != null) ? user.getRole().toString() : null;
        this.parentId = (user.getParent() != null) ? user.getParent().getId() : null;
        this.phoneno = user.getPhoneno();
    }
}



    // ✅ No-Args Constructor (Required for JSON Mapping)


//here it hides password for security

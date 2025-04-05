package com.example.paynest.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequestDTO {

    private String username;  // User’s Email (Used for Login)

    private String password;  // User’s Password (Hashed during Authentication)

}


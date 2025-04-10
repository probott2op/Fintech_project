package com.example.paynest.DTO;

import com.example.paynest.entity.Notification;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Data
public class NotificationDTO {
    private Long id;
    private String message;
    private Boolean read;  // True if notification is read
    private LocalDateTime timestamp;

    public NotificationDTO(Notification notification) {
        this.id = notification.getId();
        this.message = notification.getMessage();
        this.timestamp = notification.getTimestamp();
        this.read = notification.isRead();
        //this.id = notification.getUser().getId(); // Ensure user exists
    }

}


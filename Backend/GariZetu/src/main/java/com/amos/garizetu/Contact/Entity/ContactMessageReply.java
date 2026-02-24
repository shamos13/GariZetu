package com.amos.garizetu.Contact.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "contact_message_replies")
public class ContactMessageReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reply_id")
    private Long replyId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id", nullable = false)
    private ContactMessage contactMessage;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false, length = 120)
    private String repliedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime repliedAt;

    @PrePersist
    protected void onCreate() {
        repliedAt = LocalDateTime.now();
    }
}

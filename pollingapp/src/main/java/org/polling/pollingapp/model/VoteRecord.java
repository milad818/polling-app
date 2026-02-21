package org.polling.pollingapp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Tracks individual votes to enforce one-vote-per-user and one-vote-per-IP rules
@Entity
@Table(name = "votes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"poll_id", "user_id"}),    // One vote per user per poll
    @UniqueConstraint(columnNames = {"poll_id", "ip_address"})  // One vote per IP per poll
})
@Data
@NoArgsConstructor
public class VoteRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poll_id", nullable = false)
    private Poll poll;

    // Nullable - anonymous users won't have a user ID
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private int optionIndex;

    @Column(name = "ip_address")
    private String ipAddress;

    private LocalDateTime votedAt = LocalDateTime.now();
}

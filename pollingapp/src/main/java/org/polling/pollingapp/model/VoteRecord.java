package org.polling.pollingapp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Tracks individual votes to enforce one-vote-per-user rule
// Users can change their vote — old option decreases, new option increases
@Entity
@Table(name = "votes", uniqueConstraints = {@UniqueConstraint(columnNames = {"poll_id", "user_id"}) // One vote per user
																									// per poll
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

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	private int optionIndex;

	private LocalDateTime votedAt = LocalDateTime.now();
}

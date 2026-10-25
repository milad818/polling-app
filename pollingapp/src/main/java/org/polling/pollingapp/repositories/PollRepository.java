package org.polling.pollingapp.repositories;

import org.polling.pollingapp.model.Poll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// PollRepository is acting as the Data Access Layer - Querying, Sorting,
// Filtering
// By extending JpaRepository, you are telling Spring Boot: "I want to perform
// database operations on the Poll table, and the primary key is a Long."
// If your ID were UUID, you’d write JpaRepository<Poll, UUID>
public interface PollRepository extends JpaRepository<Poll, Long> {
	// Find all polls created by a specific user
	// Custom Derived Query: Spring interprets this as: "Go to owner, then access
	// its id!"
	// Built-in queries don't need to be redeclared e.g., findById()
	List<Poll> findByOwnerId(Long ownerId);
}

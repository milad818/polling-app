package org.polling.pollingapp.repositories;

import org.polling.pollingapp.model.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
// PollRepository is acting as the Data Access Layer - Querying, Sorting, Filtering
// By extending JpaRepository, you are telling Spring Boot: "I want to perform database operations on the Poll table, and the primary key is a Long."
public interface PollRepository extends JpaRepository<Poll, Long> {

    // Find all polls created by a specific user
    List<Poll> findByOwnerId(Long ownerId);
}

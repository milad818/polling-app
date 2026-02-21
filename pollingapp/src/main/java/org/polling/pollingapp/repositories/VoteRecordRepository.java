package org.polling.pollingapp.repositories;

import org.polling.pollingapp.model.VoteRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRecordRepository extends JpaRepository<VoteRecord, Long> {

    // Find an existing vote by a user on a specific poll (for vote-changing)
    Optional<VoteRecord> findByPollIdAndUserId(Long pollId, Long userId);
}

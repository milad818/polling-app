package org.polling.pollingapp.repositories;

import org.polling.pollingapp.model.VoteRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoteRecordRepository extends JpaRepository<VoteRecord, Long> {

    // Check if a logged-in user has already voted on a specific poll
    boolean existsByPollIdAndUserId(Long pollId, Long userId);

    // Check if an IP address has already voted on a specific poll
    boolean existsByPollIdAndIpAddress(Long pollId, String ipAddress);
}

package org.polling.pollingapp.repositories;

import org.polling.pollingapp.model.VoteRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VoteRecordRepository extends JpaRepository<VoteRecord, Long> {

	// Find an existing vote by a user on a specific poll (for vote-changing)
	Optional<VoteRecord> findByPollIdAndUserId(Long pollId, Long userId);

	// Delete all votes cast on a given poll (used before deleting the poll itself)
	void deleteByPollId(Long pollId);
}

package org.polling.pollingapp.services;

import org.polling.pollingapp.model.OptionVote;
import org.polling.pollingapp.model.Poll;
import org.polling.pollingapp.model.User;
import org.polling.pollingapp.model.VoteRecord;
import org.polling.pollingapp.repositories.PollRepository;
import org.polling.pollingapp.repositories.VoteRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

// Business Layer is implemented here
// It indicates that a class contains business logic (e.g., calculating a total, validating a user, or processing an order)
@Service
public class PollService {

    private final PollRepository pollRepository;
    private final VoteRecordRepository voteRecordRepository;

    public PollService(PollRepository pollRepository, VoteRecordRepository voteRecordRepository) {
        this.pollRepository = pollRepository;
        this.voteRecordRepository = voteRecordRepository;
    }

    // Save a poll and assign it to the authenticated owner
    public Poll savePoll(Poll poll, User owner) {
        poll.setOwner(owner);
        return pollRepository.save(poll);
    }


    public List<Poll> getAllPolls() {
        return pollRepository.findAll();
    }

    public Optional<Poll> getPollById(Long id) {
        return pollRepository.findById(id);
    }

    // Get all polls created by a specific user
    public List<Poll> getPollsByOwner(Long ownerId) {
        return pollRepository.findByOwnerId(ownerId);
    }

    // Update a poll only if the authenticated user is the owner
    public Poll updatePoll(Long pollId, Poll updatedPoll, User currentUser) {
        Poll existingPoll = getPollById(pollId)
                .orElseThrow(() -> new RuntimeException("Poll not found!"));

        if (!existingPoll.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to edit this poll!");
        }

        existingPoll.setQuestion(updatedPoll.getQuestion());
        existingPoll.setOptions(updatedPoll.getOptions());
        return pollRepository.save(existingPoll);
    }

    // Vote on a poll - enforces one-vote-per-user and one-vote-per-IP
    // user can be null for anonymous voting
    @Transactional
    public void doVote(Long pollId, int optionIndex, User user, String ipAddress) {
        // Check if this IP has already voted on this poll
        if (voteRecordRepository.existsByPollIdAndIpAddress(pollId, ipAddress)) {
            throw new RuntimeException("You have already voted on this poll!");
        }

        // If user is logged in, also check by user ID
        if (user != null && voteRecordRepository.existsByPollIdAndUserId(pollId, user.getId())) {
            throw new RuntimeException("You have already voted on this poll!");
        }

        // Get poll from DB
        Poll poll = getPollById(pollId)
                .orElseThrow(() -> new RuntimeException("Poll not found!"));

        // Extract all options
        List<OptionVote> options = poll.getOptions();

        // If index for vote invalid, throw error
        if(optionIndex < 0 || optionIndex >= options.size()) {
            throw new IllegalArgumentException("Invalid option index!");
        }

        // Get the selected option
        OptionVote selectedOption = options.get(optionIndex);

        // Increment vote for the selected option
        selectedOption.setVoteCount(selectedOption.getVoteCount() + 1);

        // Save incremented option
        pollRepository.save(poll);

        // Record the vote for tracking
        VoteRecord voteRecord = new VoteRecord();
        voteRecord.setPoll(poll);
        voteRecord.setUser(user); // null for anonymous voters
        voteRecord.setOptionIndex(optionIndex);
        voteRecord.setIpAddress(ipAddress);
        voteRecordRepository.save(voteRecord);
    }

    // Delete a poll only if the authenticated user is the owner
    public void deletePoll(Long id, User currentUser) {
        Poll poll = getPollById(id)
                .orElseThrow(() -> new RuntimeException("Poll not found!"));

        if (!poll.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You are not authorized to delete this poll!");
        }

        pollRepository.deleteById(id);
    }
}

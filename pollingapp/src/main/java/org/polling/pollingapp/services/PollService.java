package org.polling.pollingapp.services;

import org.polling.pollingapp.model.Poll;
import org.polling.pollingapp.repositories.PollRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

// Business Layer is implemented here
// It indicates that a class contains business logic (e.g., calculating a total, validating a user, or processing an order)
@Service
public class PollService {

    private final PollRepository pollRepository;

    public PollService(PollRepository pollRepository) {
        this.pollRepository = pollRepository;
    }

    public Poll savePoll(Poll poll) {
        return pollRepository.save(poll);
    }


    public List<Poll> getAllPolls() {
        return pollRepository.findAll();
    }

    public ResponseEntity<Poll> getPollById(Long id) {
        return pollRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

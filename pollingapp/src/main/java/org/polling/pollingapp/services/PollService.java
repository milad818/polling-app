package org.polling.pollingapp.services;

import org.polling.pollingapp.model.Poll;
import org.polling.pollingapp.repositories.PollRepository;
import org.springframework.stereotype.Service;

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
}

package org.polling.pollingapp.controller;

import org.polling.pollingapp.model.Poll;
import org.polling.pollingapp.model.User;
import org.polling.pollingapp.request.Vote;
import org.polling.pollingapp.services.PollService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;


// The Controller/API Layer is implemented here
// It tells Spring to take the JSON or XML data from the body of an HTTP request and "deserialize" it into a Java object.
@RestController
@RequestMapping("/api/polls")
@CrossOrigin(origins = "http://localhost:4200/")
public class PollController {
    private final PollService pollService;

    public PollController(PollService pollService) {
        this.pollService = pollService;
    }

    // Create a new poll - requires authentication, sets the owner automatically
    @PostMapping
    public Poll createPoll(@RequestBody Poll poll, @AuthenticationPrincipal User currentUser) {
        return pollService.savePoll(poll, currentUser);
    }

    // If you put a URL in both, they concatenate (join together)
    // If you leave @GetMapping empty, it defaults to the URL defined in the @RequestMapping
    @GetMapping("/all")
    public List<Poll> getPolls() {
        return pollService.getAllPolls();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Poll> getPollById(@PathVariable Long id) {

        return pollService.getPollById(id)
                // Extracts the Poll from Optional<Poll> and wraps it in a ResponseEntity
                .map(ResponseEntity::ok)
                // Manual extraction (ugly)
                //if (pollRepository.findById(id).isPresent()) {
                //    return ResponseEntity.ok(pollRepository.findById(id).get());
                //}
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all polls created by the authenticated user
    @GetMapping("/my")
    public List<Poll> getMyPolls(@AuthenticationPrincipal User currentUser) {
        return pollService.getPollsByOwner(currentUser.getId());
    }

    // Update a poll - only the owner can update their poll
    @PutMapping("/{id}")
    public ResponseEntity<Poll> updatePoll(@PathVariable Long id, @RequestBody Poll poll,
                                           @AuthenticationPrincipal User currentUser) {
        Poll updated = pollService.updatePoll(id, poll, currentUser);
        return ResponseEntity.ok(updated);
    }

    // Vote on a poll - supports both authenticated and anonymous voting
    // Tracks votes by user ID (if logged in) and IP address
    @PostMapping("/vote")
    public void doVote(@RequestBody Vote vote,
                       @AuthenticationPrincipal User currentUser,
                       HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        pollService.doVote(vote.getPollId(), vote.getOptionIndex(), currentUser, ipAddress);
    }

    // Delete a poll - only the owner can delete their poll
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePoll(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        pollService.deletePoll(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
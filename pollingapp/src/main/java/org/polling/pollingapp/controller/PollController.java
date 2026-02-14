package org.polling.pollingapp.controller;

import org.polling.pollingapp.model.Poll;
import org.polling.pollingapp.request.Vote;
import org.polling.pollingapp.services.PollService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // Below is defined a controller method to create a new poll in the table
    @PostMapping
    public Poll createPoll(@RequestBody Poll poll) {
        return pollService.savePoll(poll);
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

    @PostMapping("/vote")
    public void doVote (@RequestBody Vote vote) {
        pollService.doVote(vote.getPollId(), vote.getOptionIndex());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePoll(@PathVariable Long id) {
        pollService.deletePoll(id);
        return ResponseEntity.noContent().build();
    }
}
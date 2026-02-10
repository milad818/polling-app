package org.polling.pollingapp.controller;

import org.polling.pollingapp.model.Poll;
import org.polling.pollingapp.services.PollService;
import org.springframework.web.bind.annotation.*;

import java.util.List;


// The Controller/API Layer is implemented here
// It tells Spring to take the JSON or XML data from the body of an HTTP request and "deserialize" it into a Java object.
@RestController
@RequestMapping("/api/polls")
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
}
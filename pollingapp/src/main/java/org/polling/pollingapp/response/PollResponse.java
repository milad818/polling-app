package org.polling.pollingapp.response;

import org.polling.pollingapp.model.OptionVote;
import org.polling.pollingapp.model.Poll;

import java.time.LocalDateTime;
import java.util.List;

public record PollResponse(Long id, String question, List<OptionVote> options, OwnerSummary owner,
		LocalDateTime createdAt) {

	public static PollResponse from(Poll poll) {
		return new PollResponse(poll.getId(), poll.getQuestion(), poll.getOptions(), OwnerSummary.from(poll.getOwner()),
				poll.getCreatedAt());
	}
}

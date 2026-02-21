package org.polling.pollingapp.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.polling.pollingapp.model.OptionVote;
import org.polling.pollingapp.model.Poll;
import org.polling.pollingapp.model.User;
import org.polling.pollingapp.model.VoteRecord;
import org.polling.pollingapp.repositories.PollRepository;
import org.polling.pollingapp.repositories.VoteRecordRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PollServiceVoteTrackingTest {

    @Mock
    private PollRepository pollRepository;

    @Mock
    private VoteRecordRepository voteRecordRepository;

    @InjectMocks
    private PollService pollService;

    private User voter;
    private Poll poll;

    @BeforeEach
    void setUp() {
        voter = new User();
        voter.setId(10L);
        voter.setUsername("voter");
        voter.setEmail("voter@test.com");

        poll = new Poll();
        poll.setId(1L);
        poll.setQuestion("Favourite color?");

        OptionVote opt1 = new OptionVote();
        opt1.setOptText("Red");
        opt1.setVoteCount(0L);
        OptionVote opt2 = new OptionVote();
        opt2.setOptText("Blue");
        opt2.setVoteCount(0L);
        OptionVote opt3 = new OptionVote();
        opt3.setOptText("Green");
        opt3.setVoteCount(0L);
        poll.setOptions(new ArrayList<>(List.of(opt1, opt2, opt3)));
    }

    @Test
    void doVote_firstVote_incrementsAndCreatesRecord() {
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));
        when(voteRecordRepository.findByPollIdAndUserId(1L, 10L)).thenReturn(Optional.empty());

        pollService.doVote(1L, 0, voter);

        assertThat(poll.getOptions().get(0).getVoteCount()).isEqualTo(1L);
        verify(pollRepository).save(poll);
        verify(voteRecordRepository).save(any(VoteRecord.class));
    }

    @Test
    void doVote_changeVote_decrementsOldIncrementsNew() {
        // Voter previously voted for option 0
        VoteRecord existing = new VoteRecord();
        existing.setId(100L);
        existing.setPoll(poll);
        existing.setUser(voter);
        existing.setOptionIndex(0);

        poll.getOptions().get(0).setVoteCount(5L); // 5 votes on Red
        poll.getOptions().get(1).setVoteCount(3L); // 3 votes on Blue

        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));
        when(voteRecordRepository.findByPollIdAndUserId(1L, 10L)).thenReturn(Optional.of(existing));

        pollService.doVote(1L, 1, voter);

        // Red decremented 5 -> 4, Blue incremented 3 -> 4
        assertThat(poll.getOptions().get(0).getVoteCount()).isEqualTo(4L);
        assertThat(poll.getOptions().get(1).getVoteCount()).isEqualTo(4L);
        assertThat(existing.getOptionIndex()).isEqualTo(1); // record updated
        verify(voteRecordRepository).save(existing);
        verify(pollRepository).save(poll);
    }

    @Test
    void doVote_sameOption_doesNothing() {
        VoteRecord existing = new VoteRecord();
        existing.setOptionIndex(0);

        poll.getOptions().get(0).setVoteCount(5L);

        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));
        when(voteRecordRepository.findByPollIdAndUserId(1L, 10L)).thenReturn(Optional.of(existing));

        pollService.doVote(1L, 0, voter);

        // Nothing changed
        assertThat(poll.getOptions().get(0).getVoteCount()).isEqualTo(5L);
        verify(pollRepository, never()).save(any());
        verify(voteRecordRepository, never()).save(any());
    }

    @Test
    void doVote_invalidOptionIndex_throwsException() {
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));

        assertThatThrownBy(() -> pollService.doVote(1L, 5, voter))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid option index");
    }

    @Test
    void doVote_negativeIndex_throwsException() {
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));

        assertThatThrownBy(() -> pollService.doVote(1L, -1, voter))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid option index");
    }

    @Test
    void doVote_pollNotFound_throwsException() {
        when(pollRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pollService.doVote(99L, 0, voter))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Poll not found");
    }
}

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
import static org.mockito.ArgumentMatchers.eq;
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
        poll.setOptions(new ArrayList<>(List.of(opt1, opt2)));
    }

    @Test
    void doVote_authenticatedUser_recordsVote() {
        when(voteRecordRepository.existsByPollIdAndIpAddress(1L, "127.0.0.1")).thenReturn(false);
        when(voteRecordRepository.existsByPollIdAndUserId(1L, 10L)).thenReturn(false);
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));

        pollService.doVote(1L, 0, voter, "127.0.0.1");

        assertThat(poll.getOptions().get(0).getVoteCount()).isEqualTo(1L);
        verify(pollRepository).save(poll);
        verify(voteRecordRepository).save(any(VoteRecord.class));
    }

    @Test
    void doVote_anonymousUser_recordsVote() {
        when(voteRecordRepository.existsByPollIdAndIpAddress(1L, "192.168.1.1")).thenReturn(false);
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));

        pollService.doVote(1L, 1, null, "192.168.1.1");

        assertThat(poll.getOptions().get(1).getVoteCount()).isEqualTo(1L);
        verify(pollRepository).save(poll);
        verify(voteRecordRepository).save(any(VoteRecord.class));
    }

    @Test
    void doVote_duplicateIp_throwsException() {
        when(voteRecordRepository.existsByPollIdAndIpAddress(1L, "10.0.0.1")).thenReturn(true);

        assertThatThrownBy(() -> pollService.doVote(1L, 0, voter, "10.0.0.1"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already voted");

        verify(pollRepository, never()).save(any());
        verify(voteRecordRepository, never()).save(any());
    }

    @Test
    void doVote_duplicateUser_throwsException() {
        when(voteRecordRepository.existsByPollIdAndIpAddress(1L, "172.16.0.1")).thenReturn(false);
        when(voteRecordRepository.existsByPollIdAndUserId(1L, 10L)).thenReturn(true);

        assertThatThrownBy(() -> pollService.doVote(1L, 0, voter, "172.16.0.1"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already voted");

        verify(pollRepository, never()).save(any());
        verify(voteRecordRepository, never()).save(any());
    }

    @Test
    void doVote_invalidOptionIndex_throwsException() {
        when(voteRecordRepository.existsByPollIdAndIpAddress(1L, "127.0.0.1")).thenReturn(false);
        when(voteRecordRepository.existsByPollIdAndUserId(1L, 10L)).thenReturn(false);
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));

        assertThatThrownBy(() -> pollService.doVote(1L, 5, voter, "127.0.0.1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid option index");
    }

    @Test
    void doVote_pollNotFound_throwsException() {
        when(voteRecordRepository.existsByPollIdAndIpAddress(99L, "127.0.0.1")).thenReturn(false);
        when(voteRecordRepository.existsByPollIdAndUserId(99L, 10L)).thenReturn(false);
        when(pollRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pollService.doVote(99L, 0, voter, "127.0.0.1"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Poll not found");
    }
}

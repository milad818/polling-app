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
class PollServiceOwnershipTest {

    @Mock
    private PollRepository pollRepository;

    @Mock
    private VoteRecordRepository voteRecordRepository;

    @InjectMocks
    private PollService pollService;

    private User owner;
    private User otherUser;
    private Poll poll;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setId(1L);
        owner.setUsername("owner");
        owner.setEmail("owner@test.com");

        otherUser = new User();
        otherUser.setId(2L);
        otherUser.setUsername("other");
        otherUser.setEmail("other@test.com");

        poll = new Poll();
        poll.setId(1L);
        poll.setQuestion("Test question?");
        poll.setOwner(owner);

        OptionVote opt1 = new OptionVote();
        opt1.setOptText("Option A");
        opt1.setVoteCount(0L);
        OptionVote opt2 = new OptionVote();
        opt2.setOptText("Option B");
        opt2.setVoteCount(0L);
        poll.setOptions(new ArrayList<>(List.of(opt1, opt2)));
    }

    @Test
    void savePoll_setsOwnerAndSaves() {
        Poll newPoll = new Poll();
        newPoll.setQuestion("New poll?");

        when(pollRepository.save(any(Poll.class))).thenReturn(newPoll);

        Poll result = pollService.savePoll(newPoll, owner);

        assertThat(result.getOwner()).isEqualTo(owner);
        verify(pollRepository).save(newPoll);
    }

    @Test
    void getPollsByOwner_returnsPollsForOwner() {
        when(pollRepository.findByOwnerId(1L)).thenReturn(List.of(poll));

        List<Poll> result = pollService.getPollsByOwner(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getOwner().getId()).isEqualTo(1L);
    }

    @Test
    void updatePoll_ownerCanUpdate() {
        Poll updatedData = new Poll();
        updatedData.setQuestion("Updated question?");
        updatedData.setOptions(poll.getOptions());

        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));
        when(pollRepository.save(any(Poll.class))).thenReturn(poll);

        Poll result = pollService.updatePoll(1L, updatedData, owner);

        assertThat(result.getQuestion()).isEqualTo("Updated question?");
        verify(pollRepository).save(poll);
    }

    @Test
    void updatePoll_nonOwnerThrowsException() {
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));

        assertThatThrownBy(() -> pollService.updatePoll(1L, new Poll(), otherUser))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not authorized to edit");

        verify(pollRepository, never()).save(any());
    }

    @Test
    void updatePoll_pollNotFoundThrowsException() {
        when(pollRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pollService.updatePoll(99L, new Poll(), owner))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Poll not found");
    }

    @Test
    void deletePoll_ownerCanDelete() {
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));

        pollService.deletePoll(1L, owner);

        verify(pollRepository).deleteById(1L);
    }

    @Test
    void deletePoll_nonOwnerThrowsException() {
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));

        assertThatThrownBy(() -> pollService.deletePoll(1L, otherUser))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not authorized to delete");

        verify(pollRepository, never()).deleteById(any());
    }

    @Test
    void deletePoll_pollNotFoundThrowsException() {
        when(pollRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pollService.deletePoll(99L, owner))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Poll not found");
    }
}

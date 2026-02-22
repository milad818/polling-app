import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { PollComponent } from './poll';
import { PollService } from '../../services/poll.service';
import { AuthService } from '../../services/auth.service';
import { Poll } from '../../models/poll.model';

const mockPolls: Poll[] = [
  {
    id: 1,
    question: 'Favourite colour?',
    options: [
      { optText: 'Red', voteCount: 3 },
      { optText: 'Blue', voteCount: 7 },
    ],
    owner: { id: 10, username: 'alice', email: 'alice@example.com' },
    createdAt: '2026-01-15T10:00:00',
  },
  {
    id: 2,
    question: 'Best JS framework?',
    options: [
      { optText: 'Angular', voteCount: 0 },
      { optText: 'React', voteCount: 0 },
    ],
  },
];

describe('PollComponent', () => {
  let component: PollComponent;
  let fixture: ComponentFixture<PollComponent>;
  let pollServiceMock: {
    getPolls: ReturnType<typeof vi.fn>;
    createPoll: ReturnType<typeof vi.fn>;
    doVote: ReturnType<typeof vi.fn>;
    deletePoll: ReturnType<typeof vi.fn>;
  };
  let authServiceMock: { getUserId: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    pollServiceMock = {
      getPolls: vi.fn().mockReturnValue(of(mockPolls)),
      createPoll: vi.fn(),
      doVote: vi.fn(),
      deletePoll: vi.fn(),
    };
    authServiceMock = {
      getUserId: vi.fn().mockReturnValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [PollComponent],
      providers: [
        { provide: PollService, useValue: pollServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads polls on init', () => {
    expect(pollServiceMock.getPolls).toHaveBeenCalledTimes(1);
    expect(component.polls.length).toBe(2);
  });

  // ── getTotalVotes() ───────────────────────────────────────
  describe('getTotalVotes()', () => {
    it('returns sum of all option vote counts', () => {
      expect(component.getTotalVotes(mockPolls[0])).toBe(10);
    });

    it('returns 0 when all options have 0 votes', () => {
      expect(component.getTotalVotes(mockPolls[1])).toBe(0);
    });
  });

  // ── getPercentage() ───────────────────────────────────────
  describe('getPercentage()', () => {
    it('returns 0 when total votes is 0', () => {
      expect(component.getPercentage(mockPolls[1], 0)).toBe(0);
    });

    it('returns correct percentage for option 0 (30%)', () => {
      expect(component.getPercentage(mockPolls[0], 0)).toBe(30);
    });

    it('returns correct percentage for option 1 (70%)', () => {
      expect(component.getPercentage(mockPolls[0], 1)).toBe(70);
    });

    it('percentages for all options sum to 100 when votes exist', () => {
      const p0 = component.getPercentage(mockPolls[0], 0);
      const p1 = component.getPercentage(mockPolls[0], 1);
      expect(p0 + p1).toBe(100);
    });
  });

  // ── formatDate() ──────────────────────────────────────────
  describe('formatDate()', () => {
    it('returns empty string for undefined', () => {
      expect(component.formatDate(undefined)).toBe('');
    });

    it('returns a string containing the year for a valid ISO date', () => {
      const result = component.formatDate('2026-01-15T10:00:00');
      expect(result).toContain('2026');
    });

    it('returns a string containing an abbreviated month name', () => {
      const result = component.formatDate('2026-01-15T10:00:00');
      expect(result).toContain('Jan');
    });
  });

  // ── isOwnPoll() ───────────────────────────────────────────
  describe('isOwnPoll()', () => {
    it('returns true when poll owner id matches current user id', () => {
      authServiceMock.getUserId.mockReturnValue(10);
      expect(component.isOwnPoll(mockPolls[0])).toBe(true);
    });

    it('returns false when poll owner id does not match current user id', () => {
      authServiceMock.getUserId.mockReturnValue(99);
      expect(component.isOwnPoll(mockPolls[0])).toBe(false);
    });

    it('returns false when poll has no owner', () => {
      authServiceMock.getUserId.mockReturnValue(10);
      expect(component.isOwnPoll(mockPolls[1])).toBe(false);
    });
  });

  // ── addOption() ───────────────────────────────────────────
  describe('addOption()', () => {
    it('adds an option when below the max of 4', () => {
      component.newPoll.options = [
        { optText: 'A', voteCount: 0 },
        { optText: 'B', voteCount: 0 },
      ];
      component.addOption();
      expect(component.newPoll.options.length).toBe(3);
    });

    it('does not add beyond 4 options', () => {
      component.newPoll.options = [
        { optText: 'A', voteCount: 0 },
        { optText: 'B', voteCount: 0 },
        { optText: 'C', voteCount: 0 },
        { optText: 'D', voteCount: 0 },
      ];
      component.addOption();
      expect(component.newPoll.options.length).toBe(4);
    });
  });

  // ── removeOption() ────────────────────────────────────────
  describe('removeOption()', () => {
    it('removes an option when above the min of 2', () => {
      component.newPoll.options = [
        { optText: 'A', voteCount: 0 },
        { optText: 'B', voteCount: 0 },
        { optText: 'C', voteCount: 0 },
      ];
      component.removeOption();
      expect(component.newPoll.options.length).toBe(2);
    });

    it('does not remove below 2 options', () => {
      component.newPoll.options = [
        { optText: 'A', voteCount: 0 },
        { optText: 'B', voteCount: 0 },
      ];
      component.removeOption();
      expect(component.newPoll.options.length).toBe(2);
    });
  });

  // ── deletePoll() / cancelDelete() ────────────────────────
  describe('deletePoll()', () => {
    it('sets pollToDelete and shows the confirmation modal', () => {
      component.deletePoll(5);
      expect(component.pollToDelete).toBe(5);
      expect(component.showDeleteConfirmation).toBe(true);
    });
  });

  describe('cancelDelete()', () => {
    it('hides the confirmation modal and clears pollToDelete', () => {
      component.deletePoll(5);
      component.cancelDelete();
      expect(component.showDeleteConfirmation).toBe(false);
      expect(component.pollToDelete).toBeNull();
    });
  });

  // ── confirmDelete() ───────────────────────────────────────
  describe('confirmDelete()', () => {
    it('removes the deleted poll from the list on success', () => {
      pollServiceMock.deletePoll.mockReturnValue(of(undefined));
      component.polls = [...mockPolls];
      component.pollToDelete = 1;
      component.showDeleteConfirmation = true;

      component.confirmDelete();

      expect(pollServiceMock.deletePoll).toHaveBeenCalledWith(1);
      expect(component.polls.find((p) => p.id === 1)).toBeUndefined();
      expect(component.showDeleteConfirmation).toBe(false);
    });

    it('closes the modal even when delete fails', () => {
      pollServiceMock.deletePoll.mockReturnValue(throwError(() => new Error('server error')));
      component.polls = [...mockPolls];
      component.pollToDelete = 1;
      component.showDeleteConfirmation = true;

      component.confirmDelete();

      expect(component.showDeleteConfirmation).toBe(false);
    });

    it('does nothing when pollToDelete is null', () => {
      component.pollToDelete = null;
      component.confirmDelete();
      expect(pollServiceMock.deletePoll).not.toHaveBeenCalled();
    });
  });

  // ── createPoll() ──────────────────────────────────────────
  describe('createPoll()', () => {
    it('appends the new poll to the polls list on success', () => {
      const created: Poll = {
        id: 99,
        question: 'New poll?',
        options: [
          { optText: 'Yes', voteCount: 0 },
          { optText: 'No', voteCount: 0 },
        ],
      };
      pollServiceMock.createPoll.mockReturnValue(of(created));
      component.newPoll = {
        id: 0,
        question: 'New poll?',
        options: [
          { optText: 'Yes', voteCount: 0 },
          { optText: 'No', voteCount: 0 },
        ],
      };
      component.polls = [...mockPolls];

      component.createPoll();

      expect(component.polls.length).toBe(3);
      expect(component.polls[2].id).toBe(99);
    });

    it('resets the new poll form after creation', () => {
      const created: Poll = {
        id: 99,
        question: 'New?',
        options: [
          { optText: 'Yes', voteCount: 0 },
          { optText: 'No', voteCount: 0 },
        ],
      };
      pollServiceMock.createPoll.mockReturnValue(of(created));
      component.newPoll.question = 'New?';

      component.createPoll();

      expect(component.newPoll.question).toBe('');
      expect(component.newPoll.options.length).toBe(2);
    });
  });

  // ── doVote() ──────────────────────────────────────────────
  describe('doVote()', () => {
    it('calls pollService.doVote with the correct pollId and optionIndex', () => {
      pollServiceMock.doVote.mockReturnValue(of(undefined));

      component.doVote(1, 0);

      expect(pollServiceMock.doVote).toHaveBeenCalledWith(1, 0);
    });

    it('reloads polls from the server after a successful vote', () => {
      pollServiceMock.doVote.mockReturnValue(of(undefined));
      const initialCallCount = pollServiceMock.getPolls.mock.calls.length;

      component.doVote(1, 0);

      expect(pollServiceMock.getPolls.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });
});

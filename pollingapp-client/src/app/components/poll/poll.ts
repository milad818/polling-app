import { Component, OnInit, ChangeDetectorRef, inject, HostListener } from '@angular/core';
import { PollService } from '../../services/poll.service';
import { Poll } from '../../models/poll.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-poll',
  imports: [CommonModule, FormsModule],
  templateUrl: './poll.html',
  styleUrl: './poll.css',
})
export class PollComponent implements OnInit {
  // New poll is initialized with two options - a poll can have at least 2 options
  newPoll: Poll = {
    id: 0,
    question: '',
    options: [
      { optText: '', voteCount: 0 },
      { optText: '', voteCount: 0 },
    ],
  };

  polls: Poll[] = [];

  // Confirmation modal state
  showDeleteConfirmation = false;
  pollToDelete: number | null = null;

  // Track which option the current user voted for, per poll
  // Record<K, V> is equivalent to { [key: K]: V } but is more idiomatic
  // TypeScript — prefer it for plain key-value maps.
  userVotes: Record<number, number> = {};

  private pollService = inject(PollService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  // Use ngOnInit for initialization logic
  ngOnInit(): void {
    this.loadPolls();
  }

  get currentUserId(): number | null {
    return this.authService.getUserId();
  }

  // Calculate total votes for a poll
  getTotalVotes(poll: Poll): number {
    return poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);
  }

  // Calculate percentage for an option
  getPercentage(poll: Poll, optionIndex: number): number {
    const total = this.getTotalVotes(poll);
    if (total === 0) return 0;
    return Math.round((poll.options[optionIndex].voteCount / total) * 100);
  }

  // Format the creation date
  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Check if current user owns this poll
  isOwnPoll(poll: Poll): boolean {
    return !!poll.owner && poll.owner.id === this.currentUserId;
  }

  // Fetch data from the database
  loadPolls() {
    this.pollService.getPolls().subscribe({
      next: (data) => {
        this.polls = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching polls:', err);
      },
    });
  }

  // Create and inject a new poll into database
  createPoll() {
    // Prefix with _ to indicate the id is intentionally discarded — we let
    // the database assign a real id on insert.
    const { id: _id, ...pollData } = this.newPoll;

    this.pollService.createPoll(pollData as Poll).subscribe({
      next: (newPoll) => {
        this.polls = [...this.polls, newPoll];
        this.resetPoll();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error creating a new poll:', err);
      },
    });
  }

  resetPoll() {
    this.newPoll = {
      id: 0,
      question: '',
      options: [
        { optText: '', voteCount: 0 },
        { optText: '', voteCount: 0 },
      ],
    };
  }

  doVote(pollId: number, optionIndex: number) {
    this.pollService.doVote(pollId, optionIndex).subscribe({
      next: () => {
        // Reload polls to get accurate counts from server
        this.loadPolls();
      },
      error: (err) => {
        console.error('Error voting: ', err);
      },
    });
  }

  // Increment number of options when creating a new poll (max 4)
  addOption() {
    if (this.newPoll.options.length < 4) {
      this.newPoll.options.push({ optText: '', voteCount: 0 });
    }
  }

  removeOption() {
    if (this.newPoll.options.length > 2) {
      this.newPoll.options.pop();
    }
  }

  // Delete a poll from the database
  deletePoll(pollId: number) {
    this.pollToDelete = pollId;
    this.showDeleteConfirmation = true;
  }

  // Confirm deletion
  confirmDelete() {
    if (this.pollToDelete !== null) {
      this.pollService.deletePoll(this.pollToDelete).subscribe({
        next: () => {
          this.polls = this.polls.filter((p) => p.id !== this.pollToDelete);
          console.log('Poll deleted successfully');
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Error deleting poll:', err);
          this.cancelDelete();
        },
      });
    }
  }

  // Cancel deletion
  cancelDelete() {
    this.showDeleteConfirmation = false;
    this.pollToDelete = null;
    this.cdr.detectChanges();
  }

  // Close the delete modal when the user presses Escape.
  // Using @HostListener on the document means no div needs role="button" or
  // tabindex just to handle keyboard dismissal — the component itself listens.
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showDeleteConfirmation) {
      this.cancelDelete();
    }
  }
}

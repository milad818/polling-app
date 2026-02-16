import { Component } from '@angular/core';
import { PollService } from '../../services/poll.service';
import { Poll } from '../../models/poll.model';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

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
    question: "",
    options: [
      { optText: "", voteCount: 0 },
      { optText: "", voteCount: 0 }
    ]
  }

  polls: Poll[] = [];

  // Confirmation modal state
  showDeleteConfirmation = false;
  pollToDelete: number | null = null;

  // Use constructor only for Dependency Injection
  constructor(private pollService: PollService, private cdr: ChangeDetectorRef) {
  }

  // Use ngOnInit for initialization logic
  ngOnInit(): void {
    this.loadPolls();
  }

  // Logic to call services or initialize state goes below

  // Fetch data from the database
  loadPolls() {
    this.pollService.getPolls().subscribe({
      next: (data) => {
        // Trigger change detection; otherwise, the assignment this.polls = data happens outside a change detection cycle
        this.polls = [...data]; // Create new array reference
        this.cdr.detectChanges(); // Force detection
        console.log(this.polls);
      },
      error: (err) => {
        console.error("Error fetching polls:", err)
      }
    })
  }

  // Create and inject a new poll into database
  createPoll() {
    // Remove id field - let the database generate it
    const { id, ...pollData } = this.newPoll;

    this.pollService.createPoll(pollData as Poll).subscribe({
      next: (newPoll) => {
        this.polls = [...this.polls, newPoll]; // Use the poll returned from server
        this.resetPoll();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error creating a new poll:", err)
      }
    })
  }

  resetPoll() {
    this.newPoll = {
      id: 0,
      question: "",
      options: [
        { optText: "", voteCount: 0 },
        { optText: "", voteCount: 0 }
      ]
    }
  }

  doVote(pollId: number, optionIndex: number) {
    this.pollService.doVote(pollId, optionIndex).subscribe({
      next: () => {
        const poll = this.polls.find(p => p.id === pollId);
        if (poll) {
          poll.options[optionIndex].voteCount++;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error voting: ", err);
      }
    })
  }

  // Increment number of options when creating a new poll (max 4)
  addOption() {
    if (this.newPoll.options.length < 4) {
      this.newPoll.options.push({ optText: "", voteCount: 0 });
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
          this.polls = this.polls.filter(p => p.id !== this.pollToDelete);
          console.log('Poll deleted successfully');
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Error deleting poll:', err);
          this.cancelDelete();
        }
      });
    }
  }

  // Cancel deletion
  cancelDelete() {
    this.showDeleteConfirmation = false;
    this.pollToDelete = null;
    this.cdr.detectChanges();
  }
}

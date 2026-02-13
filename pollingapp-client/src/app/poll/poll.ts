import { Component } from '@angular/core';
import { PollService } from '../poll';
import { Poll } from '../poll.models';
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
}

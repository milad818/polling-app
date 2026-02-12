import { Component } from '@angular/core';
import { PollService } from '../poll';
import { Poll } from '../poll.models';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-poll',
  imports: [CommonModule, FormsModule],
  templateUrl: './poll.html',
  styleUrl: './poll.css',
})
export class PollComponent implements OnInit {

  polls: Poll[] = [];

  // Use constructor only for Dependency Injection
  constructor(private pollService: PollService) {
  }

  // Use ngOnInit for initialization logic
  ngOnInit(): void {
    this.loadPolls();
  }

  // Logic to call services or initialize state goes here
  loadPolls() {
    this.pollService.getPolls().subscribe({
      next: (data) => {
        this.polls = data;
        console.log(this.polls);
      },
      error: (error) => {
        console.error("Error fetching polls:", error)
      }
    })
  }

}

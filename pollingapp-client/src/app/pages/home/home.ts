import { Component } from '@angular/core';
import { PollComponent } from '../../poll/poll';

@Component({
  selector: 'app-home',
  imports: [PollComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {}

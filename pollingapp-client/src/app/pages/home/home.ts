import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PollComponent } from '../../components/poll/poll';
import { ProfileComponent } from '../../components/profile/profile';

@Component({
  selector: 'app-home',
  imports: [PollComponent, ProfileComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  constructor(private router: Router) {}

  logout(): void {
    this.router.navigate(['/login']);
  }
}

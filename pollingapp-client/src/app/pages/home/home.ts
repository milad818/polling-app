import { Component, inject } from '@angular/core';
import { PollComponent } from '../../components/poll/poll';
import { ProfileComponent } from '../../components/profile/profile';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [PollComponent, ProfileComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  private authService = inject(AuthService);

  get welcomeMessage(): string {
    const name = this.authService.getUsername();
    return name ? `Welcome, ${name}!` : 'Welcome!';
  }

  logout(): void {
    this.authService.logout();
  }
}

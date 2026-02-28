import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollComponent } from '../../components/poll/poll';
import { ProfileComponent } from '../../components/profile/profile';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';

export type PollView = 'all' | 'mine' | 'saved';

@Component({
  selector: 'app-home',
  imports: [CommonModule, PollComponent, ProfileComponent, SidebarComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  private authService = inject(AuthService);

  sidebarCollapsed = false;
  activeSection = 'dashboard';
  activeView: PollView = 'all';

  /** Sections that render the poll component with a search bar */
  readonly pollSections = new Set(['dashboard', 'all-polls', 'my-polls', 'saved-polls']);
  readonly profileSections = new Set(['dashboard']);
  readonly comingSoonSections = new Set(['analytics', 'reports', 'settings']);

  get showPollComponent(): boolean {
    return this.pollSections.has(this.activeSection);
  }

  get showProfileColumn(): boolean {
    return this.profileSections.has(this.activeSection);
  }

  get showComingSoon(): boolean {
    return this.comingSoonSections.has(this.activeSection);
  }

  get showOnlyProfile(): boolean {
    return this.activeSection === 'profile';
  }

  get sectionTitle(): string {
    const labels: Record<string, string> = {
      dashboard: 'Dashboard',
      'all-polls': 'All Polls',
      'my-polls': 'My Polls',
      'saved-polls': 'Saved Polls',
      analytics: 'Analytics',
      reports: 'Reports',
      profile: 'Profile',
      settings: 'Settings',
    };
    return labels[this.activeSection] ?? 'Dashboard';
  }

  get welcomeMessage(): string {
    const name = this.authService.getUsername();
    return name ? `Welcome, ${name}!` : 'Welcome!';
  }

  onSectionChange(section: string): void {
    this.activeSection = section;
    switch (section) {
      case 'dashboard':
      case 'all-polls':
        this.activeView = 'all';
        break;
      case 'my-polls':
        this.activeView = 'mine';
        break;
      case 'saved-polls':
        this.activeView = 'saved';
        break;
      default:
        this.activeView = 'all';
    }
  }

  onCollapsedChange(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
}

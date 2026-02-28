import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
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
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  sidebarCollapsed = false;
  activeSection = 'dashboard';
  activeView: PollView = 'all';

  readonly pollSections = new Set(['dashboard', 'all-polls', 'my-polls', 'saved-polls']);
  readonly profileSections = new Set(['dashboard']);
  readonly comingSoonSections = new Set(['analytics', 'reports', 'settings']);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const section = params['section'];
      if (section) {
        this.onSectionChange(section);
      }
    });
  }

  get showPollComponent(): boolean {
    return this.pollSections.has(this.activeSection);
  }

  get showProfileColumn(): boolean {
    return this.profileSections.has(this.activeSection);
  }

  get showComingSoon(): boolean {
    return this.comingSoonSections.has(this.activeSection);
  }

  get sectionTitle(): string {
    if (this.activeSection === 'dashboard') {
      return 'Create, Vote, and Manage Your Polls';
    }
    const labels: Record<string, string> = {
      'all-polls': 'All Polls',
      'my-polls': 'My Polls',
      'saved-polls': 'Saved Polls',
      analytics: 'Analytics',
      reports: 'Reports',
      settings: 'Settings',
    };
    return labels[this.activeSection] ?? 'Dashboard';
  }

  onLogout(): void {
    this.authService.logout();
  }

  get welcomeMessage(): string {
    const name = this.authService.getUsername();
    return name ? `Welcome, ${name}!` : 'Welcome!';
  }

  onSectionChange(section: string): void {
    if (section === 'profile') {
      this.router.navigate(['/profile']);
      return;
    }

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

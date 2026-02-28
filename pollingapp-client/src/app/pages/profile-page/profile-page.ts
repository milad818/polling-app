import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { timeout, catchError, of } from 'rxjs';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { UserService, UserProfile, UpdateProfileRequest } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

// Fields not yet in the backend — stored locally until the backend is extended.
export interface LocalProfileExtras {
  firstName: string;
  lastName: string;
  displayName: string;
  location: string;
  website: string;
  gender: string;
  dateOfBirth: string;
}

const EXTRAS_KEY = 'profileExtras';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePageComponent implements OnInit {
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  sidebarCollapsed = false;

  // Profile data from the backend
  profile: UserProfile | null = null;
  loadError = '';
  private userHasEdited = false;

  // Form state
  isSaving = false;
  saveError = '';
  saveSuccess = false;

  // Editable backend fields
  formUsername = '';
  formBio = '';
  formAvatarUrl = '';

  // Placeholder fields (stored in localStorage until backend supports them)
  formFirstName = '';
  formLastName = '';
  formDisplayName = '';
  formLocation = '';
  formWebsite = '';
  formGender = '';
  formDateOfBirth = '';

  ngOnInit(): void {
    // Render immediately from cached credentials — no spinner needed.
    const cached: UserProfile = {
      id: 0,
      username: this.authService.getUsername() ?? 'user',
      email: this.authService.getUserEmail() ?? '',
      bio: null,
      avatarUrl: localStorage.getItem('user_avatar_url') || null,
      createdAt: '',
    };
    this.profile = cached;
    this.populateForm(cached);

    // Refresh from API in background; 5 s timeout guards against slow servers.
    this.userService
      .getCurrentUser()
      .pipe(
        timeout(5000),
        catchError(() => {
          this.loadError =
            'Server unreachable — showing cached data. Live changes will sync when the backend is online.';
          return of(null);
        }),
      )
      .subscribe((user) => {
        if (user) {
          this.profile = user; // Cache avatarUrl so the next page load shows it immediately.
          localStorage.setItem('user_avatar_url', user.avatarUrl ?? ''); // Only overwrite form fields if the user hasn\'t started editing yet.
          if (!this.userHasEdited) {
            this.populateForm(user);
          }
        }
      });
  }

  private populateForm(user: UserProfile): void {
    this.formUsername = user.username;
    this.formBio = user.bio ?? '';
    this.formAvatarUrl = user.avatarUrl ?? '';

    // Load extras saved locally
    try {
      const raw = localStorage.getItem(EXTRAS_KEY);
      if (raw) {
        const extras: LocalProfileExtras = JSON.parse(raw);
        this.formFirstName = extras.firstName ?? '';
        this.formLastName = extras.lastName ?? '';
        this.formDisplayName = extras.displayName ?? '';
        this.formLocation = extras.location ?? '';
        this.formWebsite = extras.website ?? '';
        this.formGender = extras.gender ?? '';
        this.formDateOfBirth = extras.dateOfBirth ?? '';
      }
    } catch {
      /* ignore */
    }
  }

  markEdited(): void {
    this.userHasEdited = true;
  }

  onAvatarFileSelected(event: Event): void {
    this.userHasEdited = true;
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (file.size > 512000) {
      this.saveError = 'Image must be smaller than 500 KB.';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.formAvatarUrl = reader.result as string;
      this.saveError = '';
    };
    reader.readAsDataURL(file);
  }

  saveProfile(): void {
    this.isSaving = true;
    this.saveError = '';
    this.saveSuccess = false;

    // Persist placeholder fields locally
    const extras: LocalProfileExtras = {
      firstName: this.formFirstName,
      lastName: this.formLastName,
      displayName: this.formDisplayName,
      location: this.formLocation,
      website: this.formWebsite,
      gender: this.formGender,
      dateOfBirth: this.formDateOfBirth,
    };
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(extras));

    const data: UpdateProfileRequest = {
      username: this.formUsername,
      bio: this.formBio,
      avatarUrl: this.formAvatarUrl || undefined,
    };

    this.userService.updateProfile(data).subscribe({
      next: (updatedUser) => {
        this.profile = updatedUser;
        if (updatedUser.username) {
          localStorage.setItem('username', updatedUser.username);
        }
        this.isSaving = false;
        this.saveSuccess = true;
        setTimeout(() => (this.saveSuccess = false), 3000);
      },
      error: (err) => {
        this.saveError = err.error?.message || err.error || 'Failed to save changes.';
        this.isSaving = false;
      },
    });
  }

  get fullName(): string {
    return [this.formFirstName, this.formLastName].filter(Boolean).join(' ');
  }

  get avatarInitials(): string {
    const name =
      this.formFirstName ||
      this.formDisplayName ||
      this.formUsername ||
      this.profile?.username ||
      '?';
    return name.charAt(0).toUpperCase();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  onSectionChange(section: string): void {
    if (section === 'profile') return;
    this.router.navigate(['/home'], { queryParams: { section } });
  }

  onCollapsedChange(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
}

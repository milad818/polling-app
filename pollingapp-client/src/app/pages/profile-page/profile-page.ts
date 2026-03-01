import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { timeout, catchError, of } from 'rxjs';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { UserService, UserProfile, UpdateProfileRequest } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

// Local cache of profile extras — persisted to localStorage so the form
// populates immediately on next visit without waiting for the API response.
// The backend is now the source of truth; this is only a warm cache.
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
  private cdr = inject(ChangeDetectorRef);

  sidebarCollapsed = false;

  // Profile data from the backend
  profile: UserProfile | null = null;
  loadError = '';
  private userHasEdited = false;

  // Snapshot of values last loaded from the backend — used to diff on save.
  private snapshot = {
    username: '', bio: '', avatarUrl: '',
    firstName: '', lastName: '', displayName: '',
    location: '', website: '', gender: '', dateOfBirth: '',
  };

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
      firstName: null,
      lastName: null,
      displayName: null,
      location: null,
      website: null,
      gender: null,
      dateOfBirth: null,
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
          this.profile = user;
          localStorage.setItem('user_avatar_url', user.avatarUrl ?? '');
          if (!this.userHasEdited) {
            this.populateForm(user);
          }
        }
        this.cdr.detectChanges();
      });
  }

  private populateForm(user: UserProfile): void {
    this.formUsername = user.username;
    this.formBio = user.bio ?? '';
    this.formAvatarUrl = user.avatarUrl ?? '';

    this.formFirstName = user.firstName ?? this.readExtra('firstName');
    this.formLastName = user.lastName ?? this.readExtra('lastName');
    this.formDisplayName = user.displayName ?? this.readExtra('displayName');
    this.formLocation = user.location ?? this.readExtra('location');
    this.formWebsite = user.website ?? this.readExtra('website');
    this.formGender = user.gender ?? this.readExtra('gender');
    this.formDateOfBirth = user.dateOfBirth ?? this.readExtra('dateOfBirth');

    // Take a snapshot so saveProfile() can send only the changed fields.
    this.snapshot = {
      username: this.formUsername,
      bio: this.formBio,
      avatarUrl: this.formAvatarUrl,
      firstName: this.formFirstName,
      lastName: this.formLastName,
      displayName: this.formDisplayName,
      location: this.formLocation,
      website: this.formWebsite,
      gender: this.formGender,
      dateOfBirth: this.formDateOfBirth,
    };
  }

  /** Read a single field from the legacy localStorage extras cache. */
  private readExtra(key: keyof LocalProfileExtras): string {
    try {
      const raw = localStorage.getItem(EXTRAS_KEY);
      if (raw) {
        const extras: LocalProfileExtras = JSON.parse(raw);
        return extras[key] ?? '';
      }
    } catch { /* ignore */ }
    return '';
  }

  markEdited(): void {
    this.userHasEdited = true;
  }

  onAvatarFileSelected(event: Event): void {
    this.userHasEdited = true;
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    // We only store a URL string in the DB, not the raw image.
    // For now, create a local object URL for preview; the user should
    // paste an external URL into the field or use a future upload endpoint.
    // Object URLs are only valid during this browser session.
    const previewUrl = URL.createObjectURL(file);
    this.formAvatarUrl = previewUrl;
    this.saveError = '';
  }

  saveProfile(): void {
    // Build a request containing only fields whose values differ from the snapshot.
    const changed = <T>(current: T, original: T): T | undefined =>
      current !== original ? current : undefined;

    const data: UpdateProfileRequest = {
      username:    changed(this.formUsername,    this.snapshot.username)    || undefined,
      bio:         changed(this.formBio,         this.snapshot.bio),
      avatarUrl:   changed(this.formAvatarUrl,   this.snapshot.avatarUrl)   || undefined,
      firstName:   changed(this.formFirstName,   this.snapshot.firstName)   || undefined,
      lastName:    changed(this.formLastName,     this.snapshot.lastName)    || undefined,
      displayName: changed(this.formDisplayName, this.snapshot.displayName) || undefined,
      location:    changed(this.formLocation,    this.snapshot.location)    || undefined,
      website:     changed(this.formWebsite,     this.snapshot.website)     || undefined,
      gender:      changed(this.formGender,      this.snapshot.gender)      || undefined,
      dateOfBirth: changed(this.formDateOfBirth, this.snapshot.dateOfBirth) || undefined,
    };

    // If nothing changed, skip the network call entirely.
    const hasChanges = Object.values(data).some((v) => v !== undefined);
    if (!hasChanges) {
      this.saveSuccess = true;
      this.cdr.detectChanges();
      setTimeout(() => { this.saveSuccess = false; this.cdr.detectChanges(); }, 3000);
      return;
    }

    this.isSaving = true;
    this.saveError = '';
    this.saveSuccess = false;

    // Keep localStorage in sync as a warm cache.
    localStorage.setItem(EXTRAS_KEY, JSON.stringify({
      firstName:   this.formFirstName,
      lastName:    this.formLastName,
      displayName: this.formDisplayName,
      location:    this.formLocation,
      website:     this.formWebsite,
      gender:      this.formGender,
      dateOfBirth: this.formDateOfBirth,
    }));

    this.userService.updateProfile(data).subscribe({
      next: (updatedUser) => {
        this.profile = updatedUser;
        if (updatedUser.username) {
          localStorage.setItem('username', updatedUser.username);
          localStorage.setItem('user_avatar_url', updatedUser.avatarUrl ?? '');
        }
        // Refresh form with canonical values from the backend.
        this.userHasEdited = false;
        this.populateForm(updatedUser);
        this.isSaving = false;
        this.saveSuccess = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.saveSuccess = false;
          this.cdr.detectChanges();
        }, 3000);
      },
      error: (err) => {
        this.saveError = err.error?.message || err.error || 'Failed to save changes.';
        this.isSaving = false;
        this.cdr.detectChanges();
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

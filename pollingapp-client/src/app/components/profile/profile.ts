import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserProfile, UpdateProfileRequest } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  editUsername = '';
  editBio = '';
  editAvatarUrl = '';
  showEditModal = false;
  isLoading = true;
  editError = '';

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.profile = user;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openEditModal(): void {
    if (this.profile) {
      this.editUsername = this.profile.username;
      this.editBio = this.profile.bio || '';
      this.editAvatarUrl = this.profile.avatarUrl || '';
    }
    this.editError = '';
    this.showEditModal = true;
  }

  cancelEdit(): void {
    this.showEditModal = false;
    this.editError = '';
  }

  onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    // Limit to 500KB to keep things reasonable for DB storage
    if (file.size > 512000) {
      this.editError = 'Image must be smaller than 500 KB.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.editAvatarUrl = reader.result as string;
      this.editError = '';
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  confirmEdit(): void {
    const data: UpdateProfileRequest = {
      username: this.editUsername,
      bio: this.editBio,
      avatarUrl: this.editAvatarUrl || undefined
    };

    this.userService.updateProfile(data).subscribe({
      next: (updatedUser) => {
        this.profile = updatedUser;
        // Also update username in localStorage for consistency
        if (updatedUser.username) {
          localStorage.setItem('username', updatedUser.username);
        }
        this.showEditModal = false;
        this.editError = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.editError = err.error?.message || err.error || 'Failed to save changes.';
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
}

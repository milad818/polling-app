import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserProfile } from './user-profile.model';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent {
  profile: UserProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    dateOfBirth: '1990-01-15',
    phoneNumber: '+1 (555) 123-4567',
    address: '123 Main St, Springfield, IL',
    bio: 'Passionate about technology and creating meaningful polls.',
    profilePicture: null
  };

  editProfile: UserProfile = { ...this.profile };
  showEditModal = false;

  openEditModal(): void {
    this.editProfile = { ...this.profile };
    this.showEditModal = true;
  }

  cancelEdit(): void {
    this.showEditModal = false;
  }

  confirmEdit(): void {
    this.profile = { ...this.editProfile };
    this.showEditModal = false;
  }

  onProfilePictureChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.editProfile.profilePicture = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onProfilePictureUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profile.profilePicture = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}

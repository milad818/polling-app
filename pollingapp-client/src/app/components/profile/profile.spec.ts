import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ProfileComponent } from './profile';
import { UserService, UserProfile } from '../../services/user.service';

const mockProfile: UserProfile = {
  id: 1,
  username: 'alice',
  email: 'alice@example.com',
  bio: 'Hello world',
  avatarUrl: 'https://example.com/avatar.png',
  createdAt: '2026-01-15T10:00:00',
};

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let userServiceMock: {
    getCurrentUser: ReturnType<typeof vi.fn>;
    updateProfile: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    userServiceMock = {
      getCurrentUser: vi.fn().mockReturnValue(of(mockProfile)),
      updateProfile: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [{ provide: UserService, useValue: userServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── loadProfile() ─────────────────────────────────────────
  describe('loadProfile()', () => {
    it('sets profile on success', () => {
      fixture.detectChanges(); // triggers ngOnInit → loadProfile()
      expect(component.profile).toEqual(mockProfile);
    });

    it('sets isLoading to false on success', () => {
      fixture.detectChanges();
      expect(component.isLoading).toBe(false);
    });

    it('sets isLoading to false on error', () => {
      userServiceMock.getCurrentUser.mockReturnValue(throwError(() => new Error('Network error')));
      fixture.detectChanges();
      expect(component.isLoading).toBe(false);
    });

    it('leaves profile null on error', () => {
      userServiceMock.getCurrentUser.mockReturnValue(throwError(() => new Error('Network error')));
      fixture.detectChanges();
      expect(component.profile).toBeNull();
    });
  });

  // ── openEditModal() ───────────────────────────────────────
  describe('openEditModal()', () => {
    beforeEach(() => fixture.detectChanges()); // load profile first

    it('shows the edit modal', () => {
      component.openEditModal();
      expect(component.showEditModal).toBe(true);
    });

    it('populates editUsername from profile', () => {
      component.openEditModal();
      expect(component.editUsername).toBe('alice');
    });

    it('populates editBio from profile', () => {
      component.openEditModal();
      expect(component.editBio).toBe('Hello world');
    });

    it('populates editAvatarUrl from profile', () => {
      component.openEditModal();
      expect(component.editAvatarUrl).toBe('https://example.com/avatar.png');
    });

    it('clears any previous editError', () => {
      component.editError = 'previous error';
      component.openEditModal();
      expect(component.editError).toBe('');
    });
  });

  // ── cancelEdit() ──────────────────────────────────────────
  describe('cancelEdit()', () => {
    it('hides the edit modal', () => {
      component.showEditModal = true;
      component.cancelEdit();
      expect(component.showEditModal).toBe(false);
    });

    it('clears editError', () => {
      component.editError = 'some error';
      component.cancelEdit();
      expect(component.editError).toBe('');
    });
  });

  // ── onEscape() ────────────────────────────────────────────
  // Regression: the previous implementation put (keydown.escape) on the modal
  // backdrop div, which required role="button" + tabindex on that div. That
  // made clicks inside the modal (incl. programmatic avatarInput.click()) bubble
  // through the overlay handler and disrupt event flow. The fix moves keyboard
  // dismissal into @HostListener on the component so the backdrop stays a plain
  // non-interactive div.
  describe('onEscape()', () => {
    it('closes the edit modal when it is open', () => {
      component.showEditModal = true;

      component.onEscape();

      expect(component.showEditModal).toBe(false);
      expect(component.editError).toBe('');
    });

    it('does nothing when the edit modal is not open', () => {
      component.showEditModal = false;
      component.onEscape();
      expect(component.showEditModal).toBe(false);
    });
  });

  // ── confirmEdit() ─────────────────────────────────────────
  describe('confirmEdit()', () => {
    const updatedProfile: UserProfile = {
      id: 1,
      username: 'alice_updated',
      email: 'alice@example.com',
      bio: 'New bio',
      avatarUrl: null,
      createdAt: '2026-01-15T10:00:00',
    };

    beforeEach(() => {
      fixture.detectChanges();
      component.openEditModal();
      component.editUsername = 'alice_updated';
      component.editBio = 'New bio';
    });

    it('calls userService.updateProfile with the edited values', () => {
      userServiceMock.updateProfile.mockReturnValue(of(updatedProfile));
      component.confirmEdit();
      expect(userServiceMock.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'alice_updated', bio: 'New bio' }),
      );
    });

    it('updates the profile on success', () => {
      userServiceMock.updateProfile.mockReturnValue(of(updatedProfile));
      component.confirmEdit();
      expect(component.profile).toEqual(updatedProfile);
    });

    it('hides the modal on success', () => {
      userServiceMock.updateProfile.mockReturnValue(of(updatedProfile));
      component.confirmEdit();
      expect(component.showEditModal).toBe(false);
    });

    it('stores the updated username in localStorage', () => {
      userServiceMock.updateProfile.mockReturnValue(of(updatedProfile));
      component.confirmEdit();
      expect(localStorage.getItem('username')).toBe('alice_updated');
    });

    it('sets editError on failure', () => {
      userServiceMock.updateProfile.mockReturnValue(
        throwError(() => ({ error: { message: 'Username taken' } })),
      );
      component.confirmEdit();
      expect(component.editError).toBe('Username taken');
    });

    it('falls back to a default error message when server provides no error body', () => {
      userServiceMock.updateProfile.mockReturnValue(throwError(() => ({})));
      component.confirmEdit();
      expect(component.editError).toBe('Failed to save changes.');
    });

    it('clears editError on success', () => {
      component.editError = 'stale error';
      userServiceMock.updateProfile.mockReturnValue(of(updatedProfile));
      component.confirmEdit();
      expect(component.editError).toBe('');
    });
  });

  // ── onAvatarFileSelected() ────────────────────────────────
  describe('onAvatarFileSelected()', () => {
    it('does nothing when no files are provided', () => {
      const event = { target: { files: null } } as unknown as Event;
      component.onAvatarFileSelected(event);
      expect(component.editAvatarUrl).toBe('');
    });

    it('does nothing when the files list is empty', () => {
      const event = { target: { files: [] } } as unknown as Event;
      component.onAvatarFileSelected(event);
      expect(component.editAvatarUrl).toBe('');
    });

    it('sets editError when file exceeds 500 KB', () => {
      const bigFile = new File(['x'.repeat(600_000)], 'big.png', { type: 'image/png' });
      const event = { target: { files: [bigFile] } } as unknown as Event;
      component.onAvatarFileSelected(event);
      expect(component.editError).toContain('500');
    });

    it('does not change editAvatarUrl when file is too large', () => {
      component.editAvatarUrl = 'existing-url';
      const bigFile = new File(['x'.repeat(600_000)], 'big.png', { type: 'image/png' });
      const event = { target: { files: [bigFile] } } as unknown as Event;
      component.onAvatarFileSelected(event);
      expect(component.editAvatarUrl).toBe('existing-url');
    });

    it('reads the file via FileReader for a valid-size file', () => {
      const mockDataUrl = 'data:image/png;base64,abc123';
      class MockFileReader {
        onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
        readAsDataURL(_file: Blob): void {
          (this as unknown as { result: string }).result = mockDataUrl;
          this.onload?.({ target: this } as unknown as ProgressEvent<FileReader>);
        }
      }
      vi.stubGlobal('FileReader', MockFileReader);

      const smallFile = new File(['small'], 'avatar.png', { type: 'image/png' });
      const event = { target: { files: [smallFile] } } as unknown as Event;
      component.onAvatarFileSelected(event);

      expect(component.editAvatarUrl).toBe(mockDataUrl);
      expect(component.editError).toBe('');

      vi.unstubAllGlobals();
    });
  });

  // ── formatDate() ──────────────────────────────────────────
  describe('formatDate()', () => {
    it('returns empty string for undefined', () => {
      expect(component.formatDate(undefined)).toBe('');
    });

    it('returns a string containing the year', () => {
      expect(component.formatDate('2026-01-15T10:00:00')).toContain('2026');
    });

    it('returns a string containing a month name', () => {
      expect(component.formatDate('2026-01-15T10:00:00')).toContain('January');
    });

    it('returns a string containing the day', () => {
      expect(component.formatDate('2026-01-15T10:00:00')).toContain('15');
    });
  });
});

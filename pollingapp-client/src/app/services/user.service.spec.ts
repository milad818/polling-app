import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService, UserProfile } from './user.service';

const mockProfile: UserProfile = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  bio: 'Hello world',
  avatarUrl: null,
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test U.',
  location: 'London',
  website: 'https://test.dev',
  gender: 'Other',
  dateOfBirth: '1990-06-01',
  createdAt: '2026-01-01T00:00:00',
};

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── getCurrentUser() ──────────────────────────────────────
  describe('getCurrentUser()', () => {
    it('sends GET to /api/users/me and returns the profile', () => {
      service.getCurrentUser().subscribe((profile) => {
        expect(profile).toEqual(mockProfile);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/users/me');
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });
  });

  // ── updateProfile() ───────────────────────────────────────
  describe('updateProfile()', () => {
    it('sends PUT to /api/users/me with provided data', () => {
      const update = { username: 'newname', bio: 'New bio' };

      service.updateProfile(update).subscribe((profile) => {
        expect(profile.username).toBe('newname');
      });

      const req = httpMock.expectOne('http://localhost:8080/api/users/me');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(update);
      req.flush({ ...mockProfile, username: 'newname' });
    });

    it('handles partial update (only bio provided)', () => {
      service.updateProfile({ bio: 'Only bio' }).subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/users/me');
      expect(req.request.body).toEqual({ bio: 'Only bio' });
      req.flush(mockProfile);
    });

    it('handles avatarUrl update', () => {
      service.updateProfile({ avatarUrl: 'data:image/png;base64,abc' }).subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/users/me');
      expect(req.request.body).toEqual({ avatarUrl: 'data:image/png;base64,abc' });
      req.flush(mockProfile);
    });

    it('sends only the new profile fields when provided', () => {
      const update = {
        firstName: 'Alice',
        lastName: 'Smith',
        displayName: 'Alice S.',
        location: 'New York',
        website: 'https://alice.dev',
        gender: 'Female',
        dateOfBirth: '1990-01-15',
      };

      service.updateProfile(update).subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/users/me');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(update);
      req.flush({ ...mockProfile, ...update });
    });

    it('sends only changed fields (partial dirty update)', () => {
      service.updateProfile({ firstName: 'Alice', location: 'Paris' }).subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/users/me');
      expect(req.request.body).toEqual({ firstName: 'Alice', location: 'Paris' });
      req.flush(mockProfile);
    });

    it('response includes all new profile fields from the server', () => {
      service.updateProfile({ firstName: 'Alice' }).subscribe((profile) => {
        expect(profile.firstName).toBe('Alice');
        expect(profile.lastName).toBe('User');
        expect(profile.displayName).toBe('Test U.');
        expect(profile.location).toBe('London');
        expect(profile.website).toBe('https://test.dev');
        expect(profile.gender).toBe('Other');
        expect(profile.dateOfBirth).toBe('1990-06-01');
      });

      const req = httpMock.expectOne('http://localhost:8080/api/users/me');
      req.flush({ ...mockProfile, firstName: 'Alice' });
    });
  });
});

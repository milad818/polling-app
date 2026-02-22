import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';

import { AuthService, AuthResponse } from './auth.service';

const mockAuth: AuthResponse = {
  token: 'test-jwt-token',
  userId: 42,
  username: 'testuser',
  email: 'test@example.com',
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // ── login() ──────────────────────────────────────────────
  describe('login()', () => {
    it('sends POST to /api/auth/login with credentials', () => {
      service.login('test@example.com', 'Password1!').subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@example.com', password: 'Password1!' });
      req.flush(mockAuth);
    });

    it('stores all session keys in localStorage after successful login', () => {
      service.login('test@example.com', 'Password1!').subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
      req.flush(mockAuth);

      expect(localStorage.getItem('jwt_token')).toBe('test-jwt-token');
      expect(localStorage.getItem('user_id')).toBe('42');
      expect(localStorage.getItem('username')).toBe('testuser');
      expect(localStorage.getItem('user_email')).toBe('test@example.com');
    });
  });

  // ── register() ────────────────────────────────────────────
  describe('register()', () => {
    it('sends POST to /api/auth/register with email and password', () => {
      service.register('new@example.com', 'NewPass1!x').subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'new@example.com', password: 'NewPass1!x' });
      req.flush({ ...mockAuth, email: 'new@example.com' });
    });

    it('stores session in localStorage after successful registration', () => {
      service.register('new@example.com', 'NewPass1!x').subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
      req.flush(mockAuth);

      expect(localStorage.getItem('jwt_token')).toBe('test-jwt-token');
      expect(localStorage.getItem('username')).toBe('testuser');
    });
  });

  // ── logout() ──────────────────────────────────────────────
  describe('logout()', () => {
    it('removes all session keys from localStorage', () => {
      localStorage.setItem('jwt_token', 'tok');
      localStorage.setItem('user_id', '1');
      localStorage.setItem('username', 'user');
      localStorage.setItem('user_email', 'u@e.com');

      service.logout();

      expect(localStorage.getItem('jwt_token')).toBeNull();
      expect(localStorage.getItem('user_id')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      expect(localStorage.getItem('user_email')).toBeNull();
    });

    it('navigates to /login after logout', () => {
      const spy = vi.spyOn(router, 'navigate');
      service.logout();
      expect(spy).toHaveBeenCalledWith(['/login']);
    });
  });

  // ── getToken() ────────────────────────────────────────────
  describe('getToken()', () => {
    it('returns the stored JWT token', () => {
      localStorage.setItem('jwt_token', 'tok123');
      expect(service.getToken()).toBe('tok123');
    });

    it('returns null when no token is stored', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  // ── isLoggedIn() ──────────────────────────────────────────
  describe('isLoggedIn()', () => {
    it('returns true when a token is present', () => {
      localStorage.setItem('jwt_token', 'tok');
      expect(service.isLoggedIn()).toBe(true);
    });

    it('returns false when no token is present', () => {
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  // ── getUserId() ───────────────────────────────────────────
  describe('getUserId()', () => {
    it('returns the stored user id as a number', () => {
      localStorage.setItem('user_id', '7');
      expect(service.getUserId()).toBe(7);
    });

    it('returns null when user_id is not stored', () => {
      expect(service.getUserId()).toBeNull();
    });
  });

  // ── getUsername() ─────────────────────────────────────────
  describe('getUsername()', () => {
    it('returns the stored username', () => {
      localStorage.setItem('username', 'alice');
      expect(service.getUsername()).toBe('alice');
    });

    it('returns null when username is not stored', () => {
      expect(service.getUsername()).toBeNull();
    });
  });

  // ── getUserEmail() ────────────────────────────────────────
  describe('getUserEmail()', () => {
    it('returns the stored email', () => {
      localStorage.setItem('user_email', 'alice@example.com');
      expect(service.getUserEmail()).toBe('alice@example.com');
    });

    it('returns null when email is not stored', () => {
      expect(service.getUserEmail()).toBeNull();
    });
  });
});

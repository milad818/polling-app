import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login';
import { AuthService, AuthResponse } from '../../services/auth.service';

const mockAuthResponse: AuthResponse = {
  token: 'test-token',
  userId: 1,
  username: 'testuser',
  email: 'test@example.com',
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: { login: ReturnType<typeof vi.fn>; register: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn().mockReturnValue(of(mockAuthResponse)),
      register: vi.fn().mockReturnValue(of(mockAuthResponse)),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [{ provide: AuthService, useValue: authServiceMock }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── toggleMode() ──────────────────────────────────────────
  describe('toggleMode()', () => {
    it('flips isSignUp from false to true', () => {
      expect(component.isSignUp).toBe(false);
      component.toggleMode();
      expect(component.isSignUp).toBe(true);
    });

    it('flips isSignUp from true back to false', () => {
      component.isSignUp = true;
      component.toggleMode();
      expect(component.isSignUp).toBe(false);
    });

    it('clears errorMessage on toggle', () => {
      component.errorMessage = 'Previous error';
      component.toggleMode();
      expect(component.errorMessage).toBe('');
    });
  });

  // ── Password validation getters ───────────────────────────
  describe('password validation', () => {
    it('hasMinLength is true for 10+ characters', () => {
      component.signUpPassword = 'abcdefghij';
      expect(component.hasMinLength).toBe(true);
    });

    it('hasMinLength is false for fewer than 10 characters', () => {
      component.signUpPassword = 'abc';
      expect(component.hasMinLength).toBe(false);
    });

    it('hasUpperCase is true when an uppercase letter is present', () => {
      component.signUpPassword = 'Password';
      expect(component.hasUpperCase).toBe(true);
    });

    it('hasUpperCase is false when no uppercase letter', () => {
      component.signUpPassword = 'password';
      expect(component.hasUpperCase).toBe(false);
    });

    it('hasLowerCase is true when a lowercase letter is present', () => {
      component.signUpPassword = 'Password';
      expect(component.hasLowerCase).toBe(true);
    });

    it('hasLowerCase is false when all uppercase', () => {
      component.signUpPassword = 'PASSWORD';
      expect(component.hasLowerCase).toBe(false);
    });

    it('hasNumber is true when a digit is present', () => {
      component.signUpPassword = 'pass1word';
      expect(component.hasNumber).toBe(true);
    });

    it('hasNumber is false when no digit', () => {
      component.signUpPassword = 'password';
      expect(component.hasNumber).toBe(false);
    });

    it('hasSpecialChar is true when a special character is present', () => {
      component.signUpPassword = 'pass@word';
      expect(component.hasSpecialChar).toBe(true);
    });

    it('hasSpecialChar is false when no special character', () => {
      component.signUpPassword = 'password1A';
      expect(component.hasSpecialChar).toBe(false);
    });

    it('isPasswordValid is true when all five rules are satisfied', () => {
      component.signUpPassword = 'Password1!x';
      expect(component.isPasswordValid).toBe(true);
    });

    it('isPasswordValid is false when uppercase is missing', () => {
      component.signUpPassword = 'password1!x';
      expect(component.isPasswordValid).toBe(false);
    });

    it('isPasswordValid is false when special char is missing', () => {
      component.signUpPassword = 'Password1xx';
      expect(component.isPasswordValid).toBe(false);
    });

    it('passwordsMatch is true when both passwords are identical', () => {
      component.signUpPassword = 'Password1!x';
      component.signUpConfirmPassword = 'Password1!x';
      expect(component.passwordsMatch).toBe(true);
    });

    it('passwordsMatch is false when passwords differ', () => {
      component.signUpPassword = 'Password1!x';
      component.signUpConfirmPassword = 'different';
      expect(component.passwordsMatch).toBe(false);
    });
  });

  // ── Email validation getters ──────────────────────────────
  describe('email validation', () => {
    it('isSignUpEmailValid is true for a valid email', () => {
      component.signUpEmail = 'user@example.com';
      expect(component.isSignUpEmailValid).toBe(true);
    });

    it('isSignUpEmailValid is false for an invalid email', () => {
      component.signUpEmail = 'notanemail';
      expect(component.isSignUpEmailValid).toBe(false);
    });

    it('isSignInEmailValid is true for a valid email', () => {
      component.signInEmail = 'admin@test.org';
      expect(component.isSignInEmailValid).toBe(true);
    });

    it('isSignInEmailValid is false for an invalid email', () => {
      component.signInEmail = 'bad@@email';
      expect(component.isSignInEmailValid).toBe(false);
    });
  });

  // ── onSignIn() ────────────────────────────────────────────
  describe('onSignIn()', () => {
    it('does nothing when email is empty', () => {
      component.signInEmail = '';
      component.signInPassword = 'Password1!x';
      component.onSignIn();
      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('does nothing when password is empty', () => {
      component.signInEmail = 'test@example.com';
      component.signInPassword = '';
      component.onSignIn();
      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('calls authService.login with the provided credentials', () => {
      component.signInEmail = 'test@example.com';
      component.signInPassword = 'Password1!x';
      component.onSignIn();
      expect(authServiceMock.login).toHaveBeenCalledWith('test@example.com', 'Password1!x');
    });

    it('navigates to /home on successful login', () => {
      const spy = vi.spyOn(router, 'navigate');
      component.signInEmail = 'test@example.com';
      component.signInPassword = 'Password1!x';
      component.onSignIn();
      expect(spy).toHaveBeenCalledWith(['/home']);
    });

    it('sets errorMessage from backend error on login failure', () => {
      authServiceMock.login.mockReturnValue(
        throwError(() => ({ error: { message: 'Invalid email or password!' } })),
      );
      component.signInEmail = 'test@example.com';
      component.signInPassword = 'wrong';
      component.onSignIn();
      expect(component.errorMessage).toBe('Invalid email or password!');
      expect(component.isLoading).toBe(false);
    });

    it('sets a fallback errorMessage when backend provides no message', () => {
      authServiceMock.login.mockReturnValue(throwError(() => ({})));
      component.signInEmail = 'test@example.com';
      component.signInPassword = 'wrong';
      component.onSignIn();
      expect(component.errorMessage).toBe('Invalid email or password!');
    });
  });

  // ── onSignUp() ────────────────────────────────────────────
  describe('onSignUp()', () => {
    it('does nothing when signUpEmail is empty string', () => {
      component.signUpEmail = '';
      component.signUpPassword = 'Password1!x';
      component.signUpConfirmPassword = 'Password1!x';
      component.onSignUp();
      expect(authServiceMock.register).not.toHaveBeenCalled();
    });

    it('does nothing when password does not meet requirements', () => {
      component.signUpEmail = 'new@example.com';
      component.signUpPassword = 'weak';
      component.signUpConfirmPassword = 'weak';
      component.onSignUp();
      expect(authServiceMock.register).not.toHaveBeenCalled();
    });

    it('does nothing when passwords do not match', () => {
      component.signUpEmail = 'new@example.com';
      component.signUpPassword = 'Password1!x';
      component.signUpConfirmPassword = 'Different1!x';
      component.onSignUp();
      expect(authServiceMock.register).not.toHaveBeenCalled();
    });

    it('calls authService.register with email and password on valid input', () => {
      component.signUpEmail = 'new@example.com';
      component.signUpPassword = 'Password1!x';
      component.signUpConfirmPassword = 'Password1!x';
      component.onSignUp();
      expect(authServiceMock.register).toHaveBeenCalledWith('new@example.com', 'Password1!x');
    });

    it('navigates to /home on successful registration', () => {
      const spy = vi.spyOn(router, 'navigate');
      component.signUpEmail = 'new@example.com';
      component.signUpPassword = 'Password1!x';
      component.signUpConfirmPassword = 'Password1!x';
      component.onSignUp();
      expect(spy).toHaveBeenCalledWith(['/home']);
    });

    it('sets errorMessage from backend on registration failure', () => {
      authServiceMock.register.mockReturnValue(
        throwError(() => ({ error: { message: 'Email is already registered!' } })),
      );
      component.signUpEmail = 'existing@example.com';
      component.signUpPassword = 'Password1!x';
      component.signUpConfirmPassword = 'Password1!x';
      component.onSignUp();
      expect(component.errorMessage).toBe('Email is already registered!');
      expect(component.isLoading).toBe(false);
    });
  });
});

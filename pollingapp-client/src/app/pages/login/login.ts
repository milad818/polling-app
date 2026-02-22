import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  isSignUp = false;

  // Sign In fields
  signInEmail = '';
  signInPassword = '';

  // Sign Up fields
  signUpEmail = '';
  signUpPassword = '';
  signUpConfirmPassword = '';

  // Error message from backend
  errorMessage = '';
  isLoading = false;

  techItems: string[] = [
    'Angular', 'React', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt.js',
    'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Sass', 'Tailwind',
    'Node.js', 'Express', 'Spring Boot', 'Django', 'Flask', 'Laravel',
    'Ruby on Rails', 'ASP.NET', 'FastAPI', 'NestJS', 'GraphQL', 'REST API',
    'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Firebase', 'Supabase',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Vercel', 'Netlify',
    'Git', 'GitHub', 'CI/CD', 'Jenkins', 'Terraform',
    'Figma', 'Sketch', 'Adobe XD', 'Material UI', 'Bootstrap',
    'Webpack', 'Vite', 'Babel', 'ESLint', 'Prettier',
    'Jest', 'Cypress', 'Selenium', 'Playwright',
    'WebSocket', 'gRPC', 'Nginx', 'Apache', 'Linux'
  ];

  constructor(private router: Router, private authService: AuthService) {}

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = '';
  }

  // Password validation helpers
  get hasMinLength(): boolean { return this.signUpPassword.length >= 10; }
  get hasUpperCase(): boolean { return /[A-Z]/.test(this.signUpPassword); }
  get hasLowerCase(): boolean { return /[a-z]/.test(this.signUpPassword); }
  get hasNumber(): boolean { return /[0-9]/.test(this.signUpPassword); }
  get hasSpecialChar(): boolean { return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(this.signUpPassword); }
  get isPasswordValid(): boolean {
    return this.hasMinLength && this.hasUpperCase && this.hasLowerCase && this.hasNumber && this.hasSpecialChar;
  }
  get passwordsMatch(): boolean { return this.signUpPassword === this.signUpConfirmPassword; }

  // Email validation
  get isSignUpEmailValid(): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.signUpEmail); }
  get isSignInEmailValid(): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.signInEmail); }

  onSignIn(): void {
    if (!this.signInEmail || !this.signInPassword) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.signInEmail, this.signInPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.error || 'Invalid email or password!';
      }
    });
  }

  onSignUp(): void {
    if (!this.signUpEmail || !this.isPasswordValid || !this.passwordsMatch) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.signUpEmail, this.signUpPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || err.error || 'Registration failed!';
      }
    });
  }
}

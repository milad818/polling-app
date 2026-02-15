import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  signUpName = '';
  signUpEmail = '';
  signUpPassword = '';
  signUpConfirmPassword = '';

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

  constructor(private router: Router) {}

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
  }

  onSignIn(): void {
    if (this.signInEmail && this.signInPassword) {
      this.router.navigate(['/home']);
    }
  }

  onSignUp(): void {
    if (this.signUpName && this.signUpEmail && this.signUpPassword && this.signUpConfirmPassword) {
      if (this.signUpPassword === this.signUpConfirmPassword) {
        this.router.navigate(['/home']);
      }
    }
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';

  // inject() is the modern Angular 14+ alternative to constructor parameter
  // injection. It reads the same DI token but avoids boilerplate constructors
  // and works in any injection context (not only constructors).
  private http = inject(HttpClient);
  private router = inject(Router);

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(tap((res) => this.storeSession(res)));
  }

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, { email, password })
      .pipe(tap((res) => this.storeSession(res)));
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('user_email');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserId(): number | null {
    const id = localStorage.getItem('user_id');
    return id ? Number(id) : null;
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getUserEmail(): string | null {
    return localStorage.getItem('user_email');
  }

  private storeSession(res: AuthResponse): void {
    localStorage.setItem('jwt_token', res.token);
    localStorage.setItem('user_id', String(res.userId));
    localStorage.setItem('username', res.username);
    localStorage.setItem('user_email', res.email);
  }
}

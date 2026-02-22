import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('attaches Authorization Bearer header when token is present', () => {
    localStorage.setItem('jwt_token', 'my-test-token');

    http.get('/api/polls/all').subscribe();

    const req = httpMock.expectOne('/api/polls/all');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-test-token');
    req.flush([]);
  });

  it('does not attach Authorization header when no token is stored', () => {
    http.get('/api/polls/all').subscribe();

    const req = httpMock.expectOne('/api/polls/all');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('does NOT attach Authorization header to /api/auth/ requests even with a token', () => {
    localStorage.setItem('jwt_token', 'my-test-token');

    http.post('/api/auth/login', {}).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('does NOT attach Authorization header to /api/auth/register', () => {
    localStorage.setItem('jwt_token', 'my-test-token');

    http.post('/api/auth/register', {}).subscribe();

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});

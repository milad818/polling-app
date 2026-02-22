import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Don't attach token to auth endpoints
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  const token = localStorage.getItem('jwt_token');
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};

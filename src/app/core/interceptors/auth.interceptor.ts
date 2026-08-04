import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

function isErpApiUrl(url: string): boolean {
  if (url.startsWith(environment.apiUrl)) return true;

  try {
    const api = new URL(environment.apiUrl);
    const request = new URL(url, api.origin);
    return request.origin === api.origin && request.pathname.startsWith(api.pathname);
  } catch {
    return false;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  const isApiRequest = isErpApiUrl(req.url);
  const isLoginRequest = req.url.includes('/auth/login');

  let request = req;

  if (isApiRequest && token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(request).pipe(
    catchError(error => {
      if (error.status === 401 && isApiRequest && !isLoginRequest) {
        auth.clearSession();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};

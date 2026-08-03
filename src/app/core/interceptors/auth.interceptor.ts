import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const isLoginRequest = req.url.includes('/auth/login');

  let request = req;

  // Envia o token somente para a API do ERP.
  if (isApiRequest && token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Evita respostas em cache sem adicionar cabeçalhos que bloqueiam o CORS.
  if (isApiRequest && request.method === 'GET') {
    request = request.clone({
      setParams: {
        _t: Date.now().toString()
      }
    });
  }

  return next(request).pipe(
    catchError(error => {
      // Remove a sessão somente quando uma rota protegida rejeitar o token.
      if (error.status === 401 && isApiRequest && !isLoginRequest) {
        auth.clearSession();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
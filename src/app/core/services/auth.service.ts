import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UsuarioLogado } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenKey = 'autoreboque_tora_token';
  private readonly userKey = 'autoreboque_tora_user';

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request, { observe: 'response' }).pipe(
      map(response => {
        const body = response.body ?? {};
        const token = this.extractToken(body, response.headers.get('Authorization'));

        if (!token) {
          this.clearSession();
          throw new Error('Token de autenticacao nao retornado pela API.');
        }

        this.setToken(token);
        return body;
      })
    );
  }

  me(): Observable<UsuarioLogado> {
    return this.http.get<UsuarioLogado>(`${environment.apiUrl}/auth/me`).pipe(
      tap(user => localStorage.setItem(this.userKey, JSON.stringify(user)))
    );
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  }

  isAuthenticated(): boolean { return !!this.getToken(); }

  getUsuarioLocal(): UsuarioLogado | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) as UsuarioLogado : null;
  }

  setToken(token: string): void { localStorage.setItem(this.tokenKey, token); }
  clearSession(): void { localStorage.removeItem(this.tokenKey); localStorage.removeItem(this.userKey); }
  logout(): void { this.clearSession(); this.router.navigate(['/login']); }

  private extractToken(response: LoginResponse, authorizationHeader: string | null): string | null {
    const token = response.token ?? response.accessToken ?? response.access_token ?? response.jwt ?? authorizationHeader;
    return token?.replace(/^Bearer\s+/i, '').trim() || null;
  }
}

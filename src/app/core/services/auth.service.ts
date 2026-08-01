import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UsuarioLogado } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenKey = 'autoreboque_tora_token';
  private readonly userKey = 'autoreboque_tora_user';

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap(response => this.setToken(response.token))
    );
  }

  me(): Observable<UsuarioLogado> {
    return this.http.get<UsuarioLogado>(`${environment.apiUrl}/auth/me`).pipe(
      tap(user => localStorage.setItem(this.userKey, JSON.stringify(user)))
    );
  }

  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  isAuthenticated(): boolean { return !!this.getToken(); }

  getUsuarioLocal(): UsuarioLogado | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) as UsuarioLogado : null;
  }

  setToken(token: string): void { localStorage.setItem(this.tokenKey, token); }
  clearSession(): void { localStorage.removeItem(this.tokenKey); localStorage.removeItem(this.userKey); }
  logout(): void { this.clearSession(); this.router.navigate(['/login']); }
}

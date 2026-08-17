import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  UsuarioCadastroRequest,
  UsuarioSistema
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/usuarios`;

  listar(): Observable<UsuarioSistema[]> {
    return this.http.get<UsuarioSistema[]>(
      this.apiUrl
    );
  }

  cadastrar(
    dados: UsuarioCadastroRequest
  ): Observable<UsuarioSistema> {

    return this.http.post<UsuarioSistema>(
      this.apiUrl,
      dados
    );
  }

  desativar(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

  ativar(id: number): Observable<UsuarioSistema> {
    return this.http.patch<UsuarioSistema>(
      `${this.apiUrl}/${id}/ativar`,
      {}
    );
  }
}
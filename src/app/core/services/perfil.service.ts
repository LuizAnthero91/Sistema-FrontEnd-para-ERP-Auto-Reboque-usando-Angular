import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { PerfilSistema } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/perfis`;

  listar(): Observable<PerfilSistema[]> {
    return this.http.get<PerfilSistema[]>(
      this.apiUrl
    );
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrdemServico, OrdemServicoRequest, PaginaResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class OrdemServicoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ordens-servico`;

  listar(page = 0, size = 10): Observable<PaginaResponse<OrdemServico>> {
    return this.http.get<PaginaResponse<OrdemServico>>(
      `${this.apiUrl}?page=${page}&size=${size}&sort=id,asc`
    );
  }

  buscar(id: number): Observable<OrdemServico> { return this.http.get<OrdemServico>(`${this.apiUrl}/${id}`); }
  criar(payload: OrdemServicoRequest): Observable<OrdemServico> { return this.http.post<OrdemServico>(this.apiUrl, payload); }
  atualizar(id: number, payload: OrdemServicoRequest): Observable<OrdemServico> { return this.http.put<OrdemServico>(`${this.apiUrl}/${id}`, payload); }
  deletar(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
  iniciar(id: number): Observable<OrdemServico> { return this.http.patch<OrdemServico>(`${this.apiUrl}/${id}/iniciar`, {}); }
  concluir(id: number, kmReal: number | null): Observable<OrdemServico> { return this.http.patch<OrdemServico>(`${this.apiUrl}/${id}/concluir`, { kmReal }); }
  faturar(id: number): Observable<OrdemServico> { return this.http.patch<OrdemServico>(`${this.apiUrl}/${id}/faturar`, {}); }
  cancelar(id: number): Observable<OrdemServico> { return this.http.patch<OrdemServico>(`${this.apiUrl}/${id}/cancelar`, {}); }
}

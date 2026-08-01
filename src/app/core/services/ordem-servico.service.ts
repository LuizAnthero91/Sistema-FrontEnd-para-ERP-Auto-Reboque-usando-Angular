import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrdemServico, OrdemServicoRequest } from '../models/api.models';
import { BaseCrudService } from './base-crud.service';

@Injectable({ providedIn: 'root' })
export class OrdemServicoService extends BaseCrudService<OrdemServico, OrdemServicoRequest> {
  constructor() { super(inject(HttpClient), '/ordens-servico'); }
  iniciar(id: number): Observable<OrdemServico> { return this.http.patch<OrdemServico>(`${environment.apiUrl}/ordens-servico/${id}/iniciar`, {}); }
  concluir(id: number, kmReal: number | null): Observable<OrdemServico> { return this.http.patch<OrdemServico>(`${environment.apiUrl}/ordens-servico/${id}/concluir`, { kmReal }); }
  faturar(id: number): Observable<OrdemServico> { return this.http.patch<OrdemServico>(`${environment.apiUrl}/ordens-servico/${id}/faturar`, {}); }
  cancelar(id: number): Observable<OrdemServico> { return this.http.patch<OrdemServico>(`${environment.apiUrl}/ordens-servico/${id}/cancelar`, {}); }
}

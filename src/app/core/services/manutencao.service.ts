import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseCrudService } from './base-crud.service';
import { Manutencao, ManutencaoRequest } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ManutencaoService extends BaseCrudService<Manutencao, ManutencaoRequest> {
  constructor() { super(inject(HttpClient), '/manutencoes'); }
  listarPorVeiculo(veiculoId: number): Observable<Manutencao[]> { return this.http.get<Manutencao[]>(`${environment.apiUrl}/manutencoes/veiculo/${veiculoId}`); }
  iniciar(id: number): Observable<Manutencao> { return this.http.patch<Manutencao>(`${environment.apiUrl}/manutencoes/${id}/iniciar`, {}); }
  concluir(id: number): Observable<Manutencao> { return this.http.patch<Manutencao>(`${environment.apiUrl}/manutencoes/${id}/concluir`, {}); }
  cancelar(id: number): Observable<Manutencao> { return this.http.patch<Manutencao>(`${environment.apiUrl}/manutencoes/${id}/cancelar`, {}); }
}

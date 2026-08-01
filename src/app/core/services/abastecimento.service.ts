import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseCrudService } from './base-crud.service';
import { Abastecimento, AbastecimentoRequest } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AbastecimentoService extends BaseCrudService<Abastecimento, AbastecimentoRequest> {
  constructor() { super(inject(HttpClient), '/abastecimentos'); }
  listarPorVeiculo(veiculoId: number): Observable<Abastecimento[]> { return this.http.get<Abastecimento[]>(`${environment.apiUrl}/abastecimentos/veiculo/${veiculoId}`); }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseCrudService } from './base-crud.service';
import { DocumentoVeiculo, DocumentoVeiculoRequest, StatusDocumentoVeiculo } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class DocumentoVeiculoService extends BaseCrudService<DocumentoVeiculo, DocumentoVeiculoRequest> {
  constructor() { super(inject(HttpClient), '/documentos-veiculos'); }
  listarPorVeiculo(veiculoId: number): Observable<DocumentoVeiculo[]> { return this.http.get<DocumentoVeiculo[]>(`${environment.apiUrl}/documentos-veiculos/veiculo/${veiculoId}`); }
  listarPorStatus(status: StatusDocumentoVeiculo): Observable<DocumentoVeiculo[]> { return this.http.get<DocumentoVeiculo[]>(`${environment.apiUrl}/documentos-veiculos/status/${status}`); }
  atualizarStatus(id: number): Observable<DocumentoVeiculo> { return this.http.patch<DocumentoVeiculo>(`${environment.apiUrl}/documentos-veiculos/${id}/atualizar-status`, {}); }
  gerarDespesa(id: number): Observable<DocumentoVeiculo> { return this.http.patch<DocumentoVeiculo>(`${environment.apiUrl}/documentos-veiculos/${id}/gerar-despesa`, {}); }
  cancelar(id: number): Observable<DocumentoVeiculo> { return this.http.patch<DocumentoVeiculo>(`${environment.apiUrl}/documentos-veiculos/${id}/cancelar`, {}); }
}

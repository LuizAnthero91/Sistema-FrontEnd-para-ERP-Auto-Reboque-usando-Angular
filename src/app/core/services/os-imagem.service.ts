import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OsImagem } from '../models/os-imagem.model';

@Injectable({ providedIn: 'root' })
export class OsImagemService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/ordens-servico`;

  listar(ordemId: number): Observable<OsImagem[]> {
    return this.http.get<OsImagem[]>(`${this.apiUrl}/${ordemId}/imagens`);
  }

  upload(ordemId: number, file: File): Observable<OsImagem> {
    const body = new FormData();
    body.append('file', file);
    console.info('[Fotos OS] Enviando POST', {
      url: `${this.apiUrl}/${ordemId}/imagens`,
      campo: 'file', arquivo: file.name, tipo: file.type, tamanhoBytes: file.size
    });
    return this.http.post<OsImagem>(`${this.apiUrl}/${ordemId}/imagens`, body);
  }

  excluir(ordemId: number, imagemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${ordemId}/imagens/${imagemId}`);
  }
}

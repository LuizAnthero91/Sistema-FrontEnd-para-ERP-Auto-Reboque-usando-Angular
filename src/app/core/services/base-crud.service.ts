import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export abstract class BaseCrudService<T, R> {
  protected constructor(protected http: HttpClient, protected path: string) {}

  listar(): Observable<T[]> { return this.http.get<T[]>(`${environment.apiUrl}${this.path}`); }
  buscar(id: number): Observable<T> { return this.http.get<T>(`${environment.apiUrl}${this.path}/${id}`); }
  criar(payload: R): Observable<T> { return this.http.post<T>(`${environment.apiUrl}${this.path}`, payload); }
  atualizar(id: number, payload: R): Observable<T> { return this.http.put<T>(`${environment.apiUrl}${this.path}/${id}`, payload); }
  deletar(id: number): Observable<void> { return this.http.delete<void>(`${environment.apiUrl}${this.path}/${id}`); }
}

import { HttpClient } from '@angular/common/http';
import { Observable, map, retry, switchMap, timeout, timer, of } from 'rxjs';
import { environment } from '../../../environments/environment';

type ListResponse<T> = T[] | { content?: T[]; data?: T[]; items?: T[] };

export abstract class BaseCrudService<T, R> {
  protected constructor(protected http: HttpClient, protected path: string) {}

  listar(): Observable<T[]> {
    return this.listarUmaVez().pipe(
      switchMap(items => items.length ? of(items) : timer(900).pipe(switchMap(() => this.listarUmaVez())))
    );
  }

  private listarUmaVez(): Observable<T[]> {
    return this.http.get<ListResponse<T>>(`${environment.apiUrl}${this.path}`).pipe(
      timeout({ first: 10000 }),
      retry({ count: 2, delay: (_error, retryCount) => timer(retryCount * 700) }),
      map(response => this.toArray(response))
    );
  }

  buscar(id: number): Observable<T> {
    return this.http.get<T>(`${environment.apiUrl}${this.path}/${id}`).pipe(
      timeout({ first: 10000 }),
      retry({ count: 2, delay: (_error, retryCount) => timer(retryCount * 700) })
    );
  }
  criar(payload: R): Observable<T> { return this.http.post<T>(`${environment.apiUrl}${this.path}`, payload); }
  atualizar(id: number, payload: R): Observable<T> { return this.http.put<T>(`${environment.apiUrl}${this.path}/${id}`, payload); }
  deletar(id: number): Observable<void> { return this.http.delete<void>(`${environment.apiUrl}${this.path}/${id}`); }

  private toArray(response: ListResponse<T>): T[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.content)) return response.content;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.items)) return response.items;
    return [];
  }
}

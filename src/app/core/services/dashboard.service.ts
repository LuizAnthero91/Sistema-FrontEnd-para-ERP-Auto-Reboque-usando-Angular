import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry, switchMap, timeout, timer, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardFinanceiroMensal, DashboardResumo } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  resumo(): Observable<DashboardResumo> {
    return this.http.get<DashboardResumo>(`${environment.apiUrl}/dashboard/resumo`).pipe(
      timeout({ first: 10000 }),
      retry({ count: 2, delay: (_error, retryCount) => timer(retryCount * 700) })
    );
  }

  financeiroMensal(ano: number): Observable<DashboardFinanceiroMensal[]> {
    return this.financeiroMensalUmaVez(ano).pipe(
      switchMap(items => items.length ? of(items) : timer(900).pipe(switchMap(() => this.financeiroMensalUmaVez(ano))))
    );
  }

  private financeiroMensalUmaVez(ano: number): Observable<DashboardFinanceiroMensal[]> {
    return this.http.get<DashboardFinanceiroMensal[]>(`${environment.apiUrl}/dashboard/financeiro-mensal?ano=${ano}`).pipe(
      timeout({ first: 10000 }),
      retry({ count: 2, delay: (_error, retryCount) => timer(retryCount * 700) })
    );
  }
}

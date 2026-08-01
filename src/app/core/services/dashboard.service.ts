import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardFinanceiroMensal, DashboardResumo } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  resumo(): Observable<DashboardResumo> { return this.http.get<DashboardResumo>(`${environment.apiUrl}/dashboard/resumo`); }
  financeiroMensal(ano: number): Observable<DashboardFinanceiroMensal[]> { return this.http.get<DashboardFinanceiroMensal[]>(`${environment.apiUrl}/dashboard/financeiro-mensal?ano=${ano}`); }
}

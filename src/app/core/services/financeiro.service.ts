import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, retry, timeout, timer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BaseCrudService } from './base-crud.service';
import { LancamentoFinanceiro, LancamentoFinanceiroRequest, ResumoFinanceiro } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class FinanceiroService extends BaseCrudService<LancamentoFinanceiro, LancamentoFinanceiroRequest> {
  constructor() { super(inject(HttpClient), '/financeiro/lancamentos'); }
  pagar(id: number): Observable<LancamentoFinanceiro> { return this.http.patch<LancamentoFinanceiro>(`${environment.apiUrl}/financeiro/lancamentos/${id}/pagar`, {}); }
  cancelar(id: number): Observable<LancamentoFinanceiro> { return this.http.patch<LancamentoFinanceiro>(`${environment.apiUrl}/financeiro/lancamentos/${id}/cancelar`, {}); }
  resumo(inicio: string, fim: string): Observable<ResumoFinanceiro> {
    return this.http.get<ResumoFinanceiro>(`${environment.apiUrl}/financeiro/lancamentos/resumo?inicio=${inicio}&fim=${fim}`).pipe(
      timeout({ first: 10000 }),
      retry({ count: 2, delay: (_error, retryCount) => timer(retryCount * 700) })
    );
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../core/models/api.models';

export function cleanPayload<T extends Record<string, unknown>>(raw: T): T {
  const payload: Record<string, unknown> = {};
  Object.entries(raw).forEach(([key, value]) => {
    payload[key] = value === '' ? null : value;
  });
  return payload as T;
}

export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const body = error.error as Partial<ApiErrorResponse> | undefined;
    if (body?.campos?.length) {
      return body.campos.map(c => `${c.campo}: ${c.mensagem}`).join(' | ');
    }
    return body?.mensagem || body?.erro || `Erro HTTP ${error.status}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Erro inesperado. Tente novamente.';
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function monthStartIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export function monthEndIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
}

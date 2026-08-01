import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from './base-crud.service';
import { Motorista, MotoristaRequest } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class MotoristaService extends BaseCrudService<Motorista, MotoristaRequest> {
  constructor() { super(inject(HttpClient), '/motoristas'); }
}

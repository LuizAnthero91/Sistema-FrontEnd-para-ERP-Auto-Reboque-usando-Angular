import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from './base-crud.service';
import { Veiculo, VeiculoRequest } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class VeiculoService extends BaseCrudService<Veiculo, VeiculoRequest> {
  constructor() { super(inject(HttpClient), '/veiculos'); }
}

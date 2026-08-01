import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from './base-crud.service';
import { Cliente, ClienteRequest } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ClienteService extends BaseCrudService<Cliente, ClienteRequest> {
  constructor() { super(inject(HttpClient), '/clientes'); }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente, ClienteRequest } from '../../core/models/api.models';
import { ClienteService } from '../../core/services/cliente.service';
import { cleanPayload, errorMessage } from '../../shared/form-utils';
import { label, statusClienteOptions, tipoClienteOptions } from '../../shared/options';
@Component({ selector:'app-clientes', standalone:true, imports:[CommonModule,ReactiveFormsModule], templateUrl:'./clientes.component.html' })
export class ClientesComponent implements OnInit { private fb=inject(FormBuilder); private service=inject(ClienteService); itens:Cliente[]=[]; editId?:number; mostrarForm=false; erro=''; sucesso=''; label=label; tipoOptions=tipoClienteOptions; statusOptions=statusClienteOptions;
form=this.fb.group({nome:['',Validators.required],documento:[''],telefone:[''],email:['',[Validators.email]],tipo:['PARTICULAR',Validators.required],status:[null as string|null],endereco:[''],observacao:['']}); ngOnInit(){this.carregar();}
carregar(){this.service.listar().subscribe({next:r=>this.itens=r,error:e=>this.erro=errorMessage(e)});} novo(){this.editId=undefined;this.form.reset({tipo:'PARTICULAR'});this.mostrarForm=true;} editar(c:Cliente){this.editId=c.id;this.form.reset({...c});this.mostrarForm=true;} salvar(){if(this.form.invalid){this.form.markAllAsTouched();return;} const p=cleanPayload(this.form.getRawValue()) as unknown as ClienteRequest; const req=this.editId?this.service.atualizar(this.editId,p):this.service.criar(p); req.subscribe({next:()=>{this.sucesso='Cliente salvo com sucesso';this.mostrarForm=false;this.carregar();},error:e=>this.erro=errorMessage(e)});} deletar(id:number){if(confirm('Excluir cliente?'))this.service.deletar(id).subscribe({next:()=>this.carregar(),error:e=>this.erro=errorMessage(e)});} }

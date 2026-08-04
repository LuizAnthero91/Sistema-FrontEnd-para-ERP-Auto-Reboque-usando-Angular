import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente, ClienteRequest } from '../../core/models/api.models';
import { ClienteService } from '../../core/services/cliente.service';
import { cleanPayload, errorMessage } from '../../shared/form-utils';
import { label, statusClienteOptions, tipoClienteOptions } from '../../shared/options';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clientes.component.html'
})
export class ClientesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ClienteService);
  private readonly cdr = inject(ChangeDetectorRef);

  itens: Cliente[] = [];
  editId?: number;
  mostrarForm = false;
  erro = '';
  sucesso = '';
  label = label;
  tipoOptions = tipoClienteOptions;
  statusOptions = statusClienteOptions;

  form = this.fb.group({
    nome: ['', Validators.required],
    documento: [''],
    telefone: [''],
    email: ['', [Validators.email]],
    tipo: ['PARTICULAR', Validators.required],
    status: [null as string | null],
    endereco: [''],
    observacao: ['']
  });

  ngOnInit(): void { this.carregar(); }

  carregar(): void {
    this.erro = '';
    this.service.listar().subscribe({
      next: r => {
        this.itens = r;
        this.cdr.markForCheck();
      },
      error: e => {
        this.erro = errorMessage(e);
        this.cdr.markForCheck();
      }
    });
  }

  novo(): void {
    this.editId = undefined;
    this.form.reset({ tipo: 'PARTICULAR' });
    this.mostrarForm = true;
    this.cdr.markForCheck();
  }

  editar(c: Cliente): void {
    this.editId = c.id;
    this.form.reset({ ...c });
    this.mostrarForm = true;
    this.cdr.markForCheck();
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const p = cleanPayload(this.form.getRawValue()) as unknown as ClienteRequest;
    const req = this.editId ? this.service.atualizar(this.editId, p) : this.service.criar(p);

    req.subscribe({
      next: () => {
        this.sucesso = 'Cliente salvo com sucesso';
        this.mostrarForm = false;
        this.carregar();
        this.cdr.markForCheck();
      },
      error: e => {
        this.erro = errorMessage(e);
        this.cdr.markForCheck();
      }
    });
  }

  deletar(id: number): void {
    if (confirm('Excluir cliente?')) {
      this.service.deletar(id).subscribe({
        next: () => {
          this.carregar();
          this.cdr.markForCheck();
        },
        error: e => {
          this.erro = errorMessage(e);
          this.cdr.markForCheck();
        }
      });
    }
  }
}

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Motorista, MotoristaRequest } from '../../core/models/api.models';
import { MotoristaService } from '../../core/services/motorista.service';
import { cleanPayload, errorMessage } from '../../shared/form-utils';
import { label, statusMotoristaOptions } from '../../shared/options';

@Component({
  selector: 'app-motoristas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './motoristas.component.html'
})
export class MotoristasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MotoristaService);
  private readonly cdr = inject(ChangeDetectorRef);

  itens: Motorista[] = [];
  editId?: number;
  mostrarForm = false;
  erro = '';
  sucesso = '';
  label = label;
  statusOptions = statusMotoristaOptions;

  form = this.fb.group({
    nome: ['', Validators.required],
    cpf: [''],
    telefone: [''],
    cnh: [''],
    categoriaCnh: [''],
    validadeCnh: [''],
    status: [null as string | null],
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
    this.form.reset({});
    this.mostrarForm = true;
    this.cdr.markForCheck();
  }

  editar(m: Motorista): void {
    this.editId = m.id;
    this.form.reset({ ...m });
    this.mostrarForm = true;
    this.cdr.markForCheck();
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const p = cleanPayload(this.form.getRawValue()) as unknown as MotoristaRequest;
    const req = this.editId ? this.service.atualizar(this.editId, p) : this.service.criar(p);

    req.subscribe({
      next: () => {
        this.sucesso = 'Motorista salvo com sucesso';
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
    if (confirm('Excluir motorista?')) {
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

import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Veiculo, VeiculoRequest } from '../../core/models/api.models';
import { VeiculoService } from '../../core/services/veiculo.service';
import { cleanPayload, errorMessage } from '../../shared/form-utils';
import { label, statusVeiculoOptions, tipoVeiculoOptions } from '../../shared/options';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './veiculos.component.html'
})
export class VeiculosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(VeiculoService);
  private readonly cdr = inject(ChangeDetectorRef);

  itens: Veiculo[] = [];
  editId?: number;
  mostrarForm = false;
  erro = '';
  sucesso = '';
  label = label;
  tipoOptions = tipoVeiculoOptions;
  statusOptions = statusVeiculoOptions;

  form = this.fb.group({
    placa: ['', Validators.required],
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    ano: [null as number | null],
    tipo: ['GUINCHO_LEVE', Validators.required],
    status: [null as string | null],
    kmAtual: [0, Validators.required],
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
    this.form.reset({ tipo: 'GUINCHO_LEVE', kmAtual: 0 });
    this.mostrarForm = true;
    this.cdr.markForCheck();
  }

  editar(v: Veiculo): void {
    this.editId = v.id;
    this.form.reset({ ...v });
    this.mostrarForm = true;
    this.cdr.markForCheck();
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const p = cleanPayload(this.form.getRawValue()) as unknown as VeiculoRequest;
    const req = this.editId ? this.service.atualizar(this.editId, p) : this.service.criar(p);

    req.subscribe({
      next: () => {
        this.sucesso = 'Veiculo salvo com sucesso';
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
    if (confirm('Excluir veiculo?')) {
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

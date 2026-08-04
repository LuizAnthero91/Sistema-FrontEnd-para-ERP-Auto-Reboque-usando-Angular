import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Manutencao, ManutencaoRequest, Veiculo } from '../../core/models/api.models';
import { ManutencaoService } from '../../core/services/manutencao.service';
import { VeiculoService } from '../../core/services/veiculo.service';
import { cleanPayload, errorMessage, todayIso } from '../../shared/form-utils';
import { label, statusManutencaoOptions, tipoManutencaoOptions } from '../../shared/options';

@Component({
  selector: 'app-manutencoes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './manutencoes.component.html'
})
export class ManutencoesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ManutencaoService);
  private readonly veiculoService = inject(VeiculoService);
  private readonly cdr = inject(ChangeDetectorRef);

  itens: Manutencao[] = [];
  veiculos: Veiculo[] = [];
  editId?: number;
  mostrarForm = false;
  erro = '';
  sucesso = '';
  label = label;
  tipos = tipoManutencaoOptions;
  status = statusManutencaoOptions;

  form = this.fb.group({
    veiculoId: [null as number | null, Validators.required],
    tipo: ['TROCA_OLEO', Validators.required],
    status: [null as string | null],
    dataManutencao: [todayIso(), Validators.required],
    kmAtual: [null as number | null],
    descricao: ['', Validators.required],
    oficina: [''],
    custoPecas: [0],
    custoMaoObra: [0],
    proximaManutencaoKm: [null as number | null],
    proximaManutencaoData: [null as string | null],
    observacao: ['']
  });

  ngOnInit(): void {
    this.carregar();
    this.carregarVeiculos();
  }

  carregar(): void {
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

  carregarVeiculos(): void {
    this.veiculoService.listar().subscribe({
      next: r => {
        this.veiculos = r;
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
    this.form.reset({ tipo: 'TROCA_OLEO', dataManutencao: todayIso(), custoPecas: 0, custoMaoObra: 0 });
    this.mostrarForm = true;
    this.cdr.markForCheck();
  }

  editar(m: Manutencao): void {
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

    const p = cleanPayload(this.form.getRawValue()) as unknown as ManutencaoRequest;
    const req = this.editId ? this.service.atualizar(this.editId, p) : this.service.criar(p);

    req.subscribe({
      next: () => {
        this.sucesso = 'Manutencao salva';
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

  iniciar(id: number): void {
    this.service.iniciar(id).subscribe({ next: () => this.atualizarLista(), error: e => this.mostrarErro(e) });
  }

  concluir(id: number): void {
    this.service.concluir(id).subscribe({ next: () => this.atualizarLista(), error: e => this.mostrarErro(e) });
  }

  cancelar(id: number): void {
    this.service.cancelar(id).subscribe({ next: () => this.atualizarLista(), error: e => this.mostrarErro(e) });
  }

  deletar(id: number): void {
    if (confirm('Excluir manutencao?')) {
      this.service.deletar(id).subscribe({ next: () => this.atualizarLista(), error: e => this.mostrarErro(e) });
    }
  }

  private atualizarLista(): void {
    this.carregar();
    this.cdr.markForCheck();
  }

  private mostrarErro(e: unknown): void {
    this.erro = errorMessage(e);
    this.cdr.markForCheck();
  }
}

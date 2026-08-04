import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { LancamentoFinanceiro, LancamentoFinanceiroRequest, ResumoFinanceiro, Veiculo } from '../../core/models/api.models';
import { FinanceiroService } from '../../core/services/financeiro.service';
import { VeiculoService } from '../../core/services/veiculo.service';
import { cleanPayload, errorMessage, monthEndIso, monthStartIso, todayIso } from '../../shared/form-utils';
import { categoriaFinanceiraOptions, label, statusPagamentoOptions, tipoLancamentoOptions } from '../../shared/options';

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './financeiro.component.html'
})
export class FinanceiroComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FinanceiroService);
  private readonly veiculoService = inject(VeiculoService);
  private readonly cdr = inject(ChangeDetectorRef);

  itens: LancamentoFinanceiro[] = [];
  veiculos: Veiculo[] = [];
  resumo?: ResumoFinanceiro;
  editId?: number;
  mostrarForm = false;
  salvando = false;
  erro = '';
  sucesso = '';
  label = label;
  tipos = tipoLancamentoOptions;
  categorias = categoriaFinanceiraOptions;
  status = statusPagamentoOptions;
  inicio = monthStartIso();
  fim = monthEndIso();

  form = this.fb.group({
    veiculoId: [null as number | null],
    ordemServicoId: [null as number | null],
    tipo: ['DESPESA', Validators.required],
    categoria: ['DIESEL', Validators.required],
    status: [null as string | null],
    descricao: ['', Validators.required],
    valor: [0, [Validators.required, Validators.min(0.01)]],
    dataLancamento: [todayIso(), Validators.required],
    observacao: ['']
  });

  ngOnInit(): void {
    this.carregar();
    this.carregarVeiculos();
    this.carregarResumo();
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

  carregarResumo(): void {
    this.service.resumo(this.inicio, this.fim).subscribe({
      next: r => {
        this.resumo = r;
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
    this.erro = '';
    this.sucesso = '';
    this.form.reset({ tipo: 'DESPESA', categoria: 'DIESEL', valor: 0, dataLancamento: todayIso() });
    this.mostrarForm = true;
    this.cdr.markForCheck();
  }

  editar(lancamento: LancamentoFinanceiro): void {
    this.editId = lancamento.id;
    this.erro = '';
    this.sucesso = '';
    this.form.reset({ ...lancamento });
    this.mostrarForm = true;
    this.cdr.markForCheck();
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';
    this.preencherDescricaoComObservacao();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro = 'Preencha os campos obrigatorios para salvar o lancamento.';
      this.cdr.markForCheck();
      return;
    }

    this.salvando = true;
    this.cdr.markForCheck();

    const payload = cleanPayload(this.form.getRawValue()) as unknown as LancamentoFinanceiroRequest;
    const request = this.editId ? this.service.atualizar(this.editId, payload) : this.service.criar(payload);

    request.subscribe({
      next: () => {
        this.sucesso = 'Lancamento salvo';
        this.mostrarForm = false;
        this.salvando = false;
        this.carregar();
        this.carregarResumo();
        this.cdr.markForCheck();
      },
      error: e => {
        this.erro = errorMessage(e);
        this.salvando = false;
        this.cdr.markForCheck();
      }
    });
  }

  pagar(id: number): void {
    this.service.pagar(id).subscribe({
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

  cancelar(id: number): void {
    this.service.cancelar(id).subscribe({
      next: () => {
        this.carregar();
        this.carregarResumo();
        this.cdr.markForCheck();
      },
      error: e => {
        this.erro = errorMessage(e);
        this.cdr.markForCheck();
      }
    });
  }

  deletar(id: number): void {
    if (confirm('Excluir lancamento?')) {
      this.service.deletar(id).subscribe({
        next: () => {
          this.carregar();
          this.carregarResumo();
          this.cdr.markForCheck();
        },
        error: e => {
          this.erro = errorMessage(e);
          this.cdr.markForCheck();
        }
      });
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private preencherDescricaoComObservacao(): void {
    const descricao = this.form.controls.descricao.value?.trim();
    const observacao = this.form.controls.observacao.value?.trim();

    if (!descricao && observacao) {
      this.form.controls.descricao.setValue(observacao);
    }
  }
}

import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
  private fb = inject(FormBuilder);
  private service = inject(FinanceiroService);
  private veiculoService = inject(VeiculoService);

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
    this.veiculoService.listar().subscribe(r => this.veiculos = r);
    this.carregarResumo();
  }

  carregar(): void {
    this.service.listar().subscribe({ next: r => this.itens = r, error: e => this.erro = errorMessage(e) });
  }

  carregarResumo(): void {
    this.service.resumo(this.inicio, this.fim).subscribe({ next: r => this.resumo = r, error: e => this.erro = errorMessage(e) });
  }

  novo(): void {
    this.editId = undefined;
    this.erro = '';
    this.sucesso = '';
    this.form.reset({ tipo: 'DESPESA', categoria: 'DIESEL', valor: 0, dataLancamento: todayIso() });
    this.mostrarForm = true;
  }

  editar(lancamento: LancamentoFinanceiro): void {
    this.editId = lancamento.id;
    this.erro = '';
    this.sucesso = '';
    this.form.reset({ ...lancamento });
    this.mostrarForm = true;
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';
    this.preencherDescricaoComObservacao();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro = 'Preencha os campos obrigatórios para salvar o lançamento.';
      return;
    }

    this.salvando = true;
    const payload = cleanPayload(this.form.getRawValue()) as unknown as LancamentoFinanceiroRequest;
    const request = this.editId ? this.service.atualizar(this.editId, payload) : this.service.criar(payload);

    request.subscribe({
      next: () => {
        this.sucesso = 'Lançamento salvo';
        this.mostrarForm = false;
        this.salvando = false;
        this.carregar();
        this.carregarResumo();
      },
      error: e => {
        this.erro = errorMessage(e);
        this.salvando = false;
      }
    });
  }

  pagar(id: number): void {
    this.service.pagar(id).subscribe({ next: () => this.carregar(), error: e => this.erro = errorMessage(e) });
  }

  cancelar(id: number): void {
    this.service.cancelar(id).subscribe({
      next: () => {
        this.carregar();
        this.carregarResumo();
      },
      error: e => this.erro = errorMessage(e)
    });
  }

  deletar(id: number): void {
    if (confirm('Excluir lançamento?')) {
      this.service.deletar(id).subscribe({
        next: () => {
          this.carregar();
          this.carregarResumo();
        },
        error: e => this.erro = errorMessage(e)
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

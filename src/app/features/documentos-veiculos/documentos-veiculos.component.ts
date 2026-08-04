import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentoVeiculo, DocumentoVeiculoRequest, Veiculo } from '../../core/models/api.models';
import { DocumentoVeiculoService } from '../../core/services/documento-veiculo.service';
import { VeiculoService } from '../../core/services/veiculo.service';
import { cleanPayload, errorMessage, todayIso } from '../../shared/form-utils';
import { label, statusDocumentoOptions, tipoDocumentoOptions } from '../../shared/options';

@Component({
  selector: 'app-documentos-veiculos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './documentos-veiculos.component.html'
})
export class DocumentosVeiculosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(DocumentoVeiculoService);
  private readonly veiculoService = inject(VeiculoService);
  private readonly cdr = inject(ChangeDetectorRef);

  itens: DocumentoVeiculo[] = [];
  veiculos: Veiculo[] = [];
  editId?: number;
  mostrarForm = false;
  erro = '';
  sucesso = '';
  label = label;
  tipos = tipoDocumentoOptions;
  status = statusDocumentoOptions;

  form = this.fb.group({
    veiculoId: [null as number | null, Validators.required],
    tipo: ['CRLV', Validators.required],
    status: [null as string | null],
    numeroDocumento: [''],
    dataEmissao: [todayIso()],
    dataVencimento: ['', Validators.required],
    valor: [0],
    orgaoEmissor: [''],
    arquivoUrl: [''],
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
    this.form.reset({ tipo: 'CRLV', dataEmissao: todayIso(), valor: 0 });
    this.mostrarForm = true;
    this.cdr.markForCheck();
  }

  editar(d: DocumentoVeiculo): void {
    this.editId = d.id;
    this.form.reset({ ...d });
    this.mostrarForm = true;
    this.cdr.markForCheck();
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const p = cleanPayload(this.form.getRawValue()) as unknown as DocumentoVeiculoRequest;
    const req = this.editId ? this.service.atualizar(this.editId, p) : this.service.criar(p);

    req.subscribe({
      next: () => {
        this.sucesso = 'Documento salvo';
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

  atualizarStatus(id: number): void {
    this.service.atualizarStatus(id).subscribe({ next: () => this.atualizarLista(), error: e => this.mostrarErro(e) });
  }

  gerarDespesa(id: number): void {
    this.service.gerarDespesa(id).subscribe({ next: () => this.atualizarLista(), error: e => this.mostrarErro(e) });
  }

  cancelar(id: number): void {
    this.service.cancelar(id).subscribe({ next: () => this.atualizarLista(), error: e => this.mostrarErro(e) });
  }

  deletar(id: number): void {
    if (confirm('Excluir documento?')) {
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

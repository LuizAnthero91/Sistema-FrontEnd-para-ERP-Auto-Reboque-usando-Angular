import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Abastecimento, AbastecimentoRequest, Motorista, Veiculo } from '../../core/models/api.models';
import { AbastecimentoService } from '../../core/services/abastecimento.service';
import { MotoristaService } from '../../core/services/motorista.service';
import { VeiculoService } from '../../core/services/veiculo.service';
import { cleanPayload, errorMessage, todayIso } from '../../shared/form-utils';

@Component({
  selector: 'app-abastecimentos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './abastecimentos.component.html'
})
export class AbastecimentosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AbastecimentoService);
  private readonly veiculoService = inject(VeiculoService);
  private readonly motoristaService = inject(MotoristaService);
  private readonly cdr = inject(ChangeDetectorRef);

  itens: Abastecimento[] = [];
  veiculos: Veiculo[] = [];
  motoristas: Motorista[] = [];
  erro = '';
  sucesso = '';
  mostrarForm = false;

  form = this.fb.group({
    veiculoId: [null as number | null, Validators.required],
    motoristaId: [null as number | null],
    dataAbastecimento: [todayIso(), Validators.required],
    kmAtual: [0, Validators.required],
    litros: [0, Validators.required],
    valorLitro: [0, Validators.required],
    posto: [''],
    observacao: ['']
  });

  ngOnInit(): void {
    this.carregar();
    this.carregarVeiculos();
    this.carregarMotoristas();
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

  carregarMotoristas(): void {
    this.motoristaService.listar().subscribe({
      next: r => {
        this.motoristas = r;
        this.cdr.markForCheck();
      },
      error: e => {
        this.erro = errorMessage(e);
        this.cdr.markForCheck();
      }
    });
  }

  novo(): void {
    this.form.reset({ dataAbastecimento: todayIso(), kmAtual: 0, litros: 0, valorLitro: 0 });
    this.mostrarForm = true;
    this.cdr.markForCheck();
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const p = cleanPayload(this.form.getRawValue()) as unknown as AbastecimentoRequest;
    this.service.criar(p).subscribe({
      next: () => {
        this.sucesso = 'Abastecimento lancado e despesa gerada';
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
    if (confirm('Excluir abastecimento?')) {
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

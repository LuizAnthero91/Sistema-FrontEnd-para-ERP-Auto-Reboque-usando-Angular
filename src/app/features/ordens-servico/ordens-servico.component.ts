import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import {
  Cliente,
  Motorista,
  OrdemServico,
  OrdemServicoRequest,
  Veiculo
} from '../../core/models/api.models';

import { ClienteService } from '../../core/services/cliente.service';
import { MotoristaService } from '../../core/services/motorista.service';
import { OrdemServicoService } from '../../core/services/ordem-servico.service';
import { VeiculoService } from '../../core/services/veiculo.service';

import {
  cleanPayload,
  errorMessage
} from '../../shared/form-utils';

import {
  label,
  statusOrdemOptions,
  tipoServicoOptions
} from '../../shared/options';

@Component({
  selector: 'app-ordens-servico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe
  ],
  templateUrl: './ordens-servico.component.html'
})
export class OrdensServicoComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  private readonly service = inject(OrdemServicoService);
  private readonly clienteService = inject(ClienteService);
  private readonly veiculoService = inject(VeiculoService);
  private readonly motoristaService = inject(MotoristaService);

  itens: OrdemServico[] = [];
  clientes: Cliente[] = [];
  veiculos: Veiculo[] = [];
  motoristas: Motorista[] = [];

  editId?: number;

  mostrarForm = false;
  erro = '';
  sucesso = '';

  readonly label = label;
  readonly tipoOptions = tipoServicoOptions;
  readonly statusOptions = statusOrdemOptions;

  form = this.fb.group({
    clienteId: [
      null as number | null,
      Validators.required
    ],

    /*
     * Guincho ou veículo da frota da empresa.
     */
    veiculoId: [
      null as number | null
    ],

    motoristaId: [
      null as number | null
    ],

    tipoServico: [
      'REMOCAO_VEICULO_LEVE',
      Validators.required
    ],

    status: [
      null as string | null
    ],

    origem: [
      '',
      Validators.required
    ],

    destino: [''],

    /*
     * Dados internos da operação.
     */
    kmEstimado: [
      null as number | null
    ],

    kmReal: [
      null as number | null
    ],

    valorCobrado: [0],
    custoEstimado: [0],

    observacao: [''],

    /*
     * Veículo atendido do cliente.
     */
    veiculoClientePlaca: [
      '',
      [
        Validators.maxLength(10),
        Validators.pattern(/^[A-Za-z0-9-]{0,10}$/)
      ]
    ],

    veiculoClienteMarca: [
      '',
      Validators.maxLength(80)
    ],

    veiculoClienteModelo: [
      '',
      Validators.maxLength(100)
    ],

    veiculoClienteCor: [
      '',
      Validators.maxLength(50)
    ],

    veiculoClienteAno: [
      null as number | null,
      [
        Validators.min(1900),
        Validators.max(2100)
      ]
    ],

    veiculoClienteKm: [
      null as number | null,
      Validators.min(0)
    ],

    veiculoClienteObservacao: [
      '',
      Validators.maxLength(1000)
    ]
  });

  ngOnInit(): void {
    this.carregar();

    this.clienteService.listar().subscribe({
      next: resposta => {
        this.clientes = resposta;
      },
      error: erro => {
        this.erro = errorMessage(erro);
      }
    });

    this.veiculoService.listar().subscribe({
      next: resposta => {
        this.veiculos = resposta;
      },
      error: erro => {
        this.erro = errorMessage(erro);
      }
    });

    this.motoristaService.listar().subscribe({
      next: resposta => {
        this.motoristas = resposta;
      },
      error: erro => {
        this.erro = errorMessage(erro);
      }
    });
  }

  carregar(): void {
    this.erro = '';

    this.service.listar().subscribe({
      next: resposta => {
        this.itens = resposta;
      },
      error: erro => {
        this.erro = errorMessage(erro);
      }
    });
  }

  novo(): void {
    this.editId = undefined;
    this.erro = '';
    this.sucesso = '';

    this.form.reset({
      clienteId: null,
      veiculoId: null,
      motoristaId: null,

      tipoServico: 'REMOCAO_VEICULO_LEVE',
      status: null,

      origem: '',
      destino: '',

      kmEstimado: null,
      kmReal: null,

      valorCobrado: 0,
      custoEstimado: 0,

      observacao: '',

      veiculoClientePlaca: '',
      veiculoClienteMarca: '',
      veiculoClienteModelo: '',
      veiculoClienteCor: '',
      veiculoClienteAno: null,
      veiculoClienteKm: null,
      veiculoClienteObservacao: ''
    });

    this.mostrarForm = true;
  }

  editar(ordem: OrdemServico): void {
    this.editId = ordem.id;
    this.erro = '';
    this.sucesso = '';

    this.form.reset({
      clienteId: ordem.clienteId,
      veiculoId: ordem.veiculoId ?? null,
      motoristaId: ordem.motoristaId ?? null,

      tipoServico: ordem.tipoServico,
      status: ordem.status,

      origem: ordem.origem,
      destino: ordem.destino ?? '',

      kmEstimado: ordem.kmEstimado ?? null,
      kmReal: ordem.kmReal ?? null,

      valorCobrado: ordem.valorCobrado ?? 0,
      custoEstimado: ordem.custoEstimado ?? 0,

      observacao: ordem.observacao ?? '',

      veiculoClientePlaca:
        ordem.veiculoClientePlaca ?? '',

      veiculoClienteMarca:
        ordem.veiculoClienteMarca ?? '',

      veiculoClienteModelo:
        ordem.veiculoClienteModelo ?? '',

      veiculoClienteCor:
        ordem.veiculoClienteCor ?? '',

      veiculoClienteAno:
        ordem.veiculoClienteAno ?? null,

      veiculoClienteKm:
        ordem.veiculoClienteKm ?? null,

      veiculoClienteObservacao:
        ordem.veiculoClienteObservacao ?? ''
    });

    this.mostrarForm = true;
  }

  salvar(): void {
    this.erro = '';
    this.sucesso = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro = 'Verifique os campos destacados antes de salvar.';
      return;
    }

    const valorFormulario = this.form.getRawValue();

    const payload = cleanPayload({
      ...valorFormulario,

      veiculoClientePlaca:
        valorFormulario.veiculoClientePlaca
          ?.trim()
          .toUpperCase(),

      veiculoClienteMarca:
        valorFormulario.veiculoClienteMarca?.trim(),

      veiculoClienteModelo:
        valorFormulario.veiculoClienteModelo?.trim(),

      veiculoClienteCor:
        valorFormulario.veiculoClienteCor?.trim(),

      veiculoClienteObservacao:
        valorFormulario.veiculoClienteObservacao?.trim()
    }) as unknown as OrdemServicoRequest;

    const requisicao = this.editId
      ? this.service.atualizar(this.editId, payload)
      : this.service.criar(payload);

    requisicao.subscribe({
      next: ordem => {
        this.sucesso = this.editId
          ? `OS ${ordem.numeroOs} atualizada com sucesso.`
          : `OS ${ordem.numeroOs} criada com sucesso.`;

        this.mostrarForm = false;
        this.editId = undefined;

        this.carregar();
      },
      error: erro => {
        this.erro = errorMessage(erro);
      }
    });
  }

  visualizarRelatorio(ordem: OrdemServico): void {
    this.router.navigate([
      '/ordens-servico',
      ordem.id,
      'relatorio'
    ]);
  }

  iniciar(id: number): void {
    this.service.iniciar(id).subscribe({
      next: () => {
        this.sucesso = 'Atendimento iniciado.';
        this.carregar();
      },
      error: erro => {
        this.erro = errorMessage(erro);
      }
    });
  }

  concluir(id: number): void {
    const valorInformado = prompt(
      'KM interno da operação. Deixe vazio caso não queira informar:'
    );

    const kmReal = valorInformado?.trim()
      ? Number(valorInformado)
      : null;

    if (
      kmReal !== null &&
      (!Number.isFinite(kmReal) || kmReal < 0)
    ) {
      this.erro = 'Informe uma quilometragem válida.';
      return;
    }

    this.service.concluir(id, kmReal).subscribe({
      next: () => {
        this.sucesso = 'Ordem de serviço concluída.';
        this.carregar();
      },
      error: erro => {
        this.erro = errorMessage(erro);
      }
    });
  }

  faturar(id: number): void {
    this.service.faturar(id).subscribe({
      next: () => {
        this.sucesso = 'Ordem de serviço faturada.';
        this.carregar();
      },
      error: erro => {
        this.erro = errorMessage(erro);
      }
    });
  }

  cancelar(id: number): void {
    const confirmado = confirm(
      'Deseja realmente cancelar esta ordem de serviço?'
    );

    if (!confirmado) {
      return;
    }

    this.service.cancelar(id).subscribe({
      next: () => {
        this.sucesso = 'Ordem de serviço cancelada.';
        this.carregar();
      },
      error: erro => {
        this.erro = errorMessage(erro);
      }
    });
  }

  deletar(id: number): void {
    const confirmado = confirm(
      'Deseja realmente excluir esta ordem de serviço?'
    );

    if (!confirmado) {
      return;
    }

    this.service.deletar(id).subscribe({
      next: () => {
        this.sucesso = 'Ordem de serviço excluída.';
        this.carregar();
      },
      error: erro => {
        this.erro = errorMessage(erro);
      }
    });
  }

  cancelarFormulario(): void {
    this.mostrarForm = false;
    this.editId = undefined;
    this.erro = '';
  }
}
import {
  CommonModule,
  CurrencyPipe,
  DatePipe
} from '@angular/common';

import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { OrdemServico } from '../../core/models/api.models';
import { OrdemServicoService } from '../../core/services/ordem-servico.service';
import { errorMessage } from '../../shared/form-utils';
import { label } from '../../shared/options';

@Component({
  selector: 'app-ordem-servico-relatorio',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './ordem-servico-relatorio.component.html',
  styleUrl: './ordem-servico-relatorio.component.css'
})
export class OrdemServicoRelatorioComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly ordemServicoService = inject(
    OrdemServicoService
  );

  ordem?: OrdemServico;

  carregando = true;
  erro = '';

  readonly label = label;

  readonly empresa = {
    nomeFantasia: 'Auto Reboque Torá',
    razaoSocial: 'Bruno Avelar Ferreira da Silva',
    cnpj: '34.669.538/0001-05',
    telefoneFixo: '(31) 3533-3155',
    whatsapp: '(31) 99657-8641',
    horario: 'Disponível 24 horas por dia',
    localAtendimento: 'Ibirité e Grande Belo Horizonte'
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      this.erro =
        'Identificador da ordem de serviço inválido.';

      this.carregando = false;
      return;
    }

    this.carregarOrdem(id);
  }

  private carregarOrdem(id: number): void {
    this.carregando = true;
    this.erro = '';

    this.ordemServicoService.buscar(id).subscribe({
      next: ordem => {
        this.ordem = ordem;
        this.carregando = false;
      },

      error: erro => {
        this.erro = errorMessage(erro);
        this.carregando = false;
      }
    });
  }

  imprimir(): void {
    if (!this.ordem) {
      return;
    }

    window.print();
  }

  voltar(): void {
    this.router.navigate(['/ordens-servico']);
  }

  valorOuZero(valor?: number | null): number {
    return valor ?? 0;
  }

  valorLiquido(): number {
    return this.valorOuZero(
      this.ordem?.valorCobrado
    );
  }
}
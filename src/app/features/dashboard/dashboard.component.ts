import { CommonModule, CurrencyPipe } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import { DashboardFinanceiroMensal, DashboardResumo, LancamentoFinanceiro } from '../../core/models/api.models';
import { DashboardService } from '../../core/services/dashboard.service';
import { FinanceiroService } from '../../core/services/financeiro.service';
import { errorMessage } from '../../shared/form-utils';
import { label } from '../../shared/options';

Chart.register(...registerables);

interface CategoriaGasto {
  categoria: string;
  valor: number;
  percentual: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewChecked, OnDestroy, OnInit {
  private readonly service = inject(DashboardService);
  private readonly financeiroService = inject(FinanceiroService);
  @ViewChild('despesasChart') private despesasCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('fluxoChart') private fluxoCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('mensalChart') private mensalCanvas?: ElementRef<HTMLCanvasElement>;

  resumo?: DashboardResumo;
  despesasPorCategoria: CategoriaGasto[] = [];
  maioresDespesas: LancamentoFinanceiro[] = [];
  totalDespesasMapeadas = 0;
  margemLucro = 0;
  anoSelecionado = new Date().getFullYear();
  financeiroMensalChartData?: ChartData<'line'>;
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#334155',
          boxWidth: 14,
          padding: 16
        }
      },
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: ${this.moeda(Number(context.raw ?? 0))}`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#475569' },
        grid: { display: false }
      },
      y: {
        ticks: {
          color: '#64748b',
          callback: value => this.moedaSemCentavos(Number(value))
        },
        grid: { color: '#e2e8f0' }
      }
    }
  };
  erro = '';
  loading = true;
  private despesasChart?: Chart;
  private fluxoChart?: Chart;
  private mensalChart?: Chart;
  private renderPendente = false;
  private renderMensalPendente = false;

  ngOnInit(): void { this.carregar(); }

  ngAfterViewChecked(): void {
    if (this.renderPendente && this.despesasCanvas && this.fluxoCanvas) {
      this.renderPendente = false;
      queueMicrotask(() => this.renderGraficos());
    }

    if (this.renderMensalPendente && this.mensalCanvas) {
      this.renderMensalPendente = false;
      queueMicrotask(() => this.renderGraficoMensal());
    }
  }

  ngOnDestroy(): void {
    this.despesasChart?.destroy();
    this.fluxoChart?.destroy();
    this.mensalChart?.destroy();
  }

  carregar(): void {
    this.loading = true;
    this.erro = '';
    forkJoin({
      resumo: this.service.resumo(),
      lancamentos: this.financeiroService.listar()
    }).subscribe({
      next: ({ resumo, lancamentos }) => {
        this.resumo = resumo;
        this.prepararIndicadores(lancamentos, resumo);
        this.renderPendente = true;
        this.carregarFinanceiroMensal();
      },
      error: e => {
        this.erro = errorMessage(e);
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }

  nomeCategoria(categoria: string): string {
    return label(categoria);
  }

  carregarFinanceiroMensal(): void {
    this.service.financeiroMensal(this.anoSelecionado).subscribe({
      next: dados => {
        this.montarGraficoFinanceiroMensal(dados);
        this.renderMensalPendente = true;
      },
      error: () => console.error('Erro ao carregar historico financeiro mensal')
    });
  }

  private montarGraficoFinanceiroMensal(dados: DashboardFinanceiroMensal[]): void {
    this.financeiroMensalChartData = {
      labels: dados.map(item => item.nomeMes),
      datasets: [
        {
          label: 'Receitas',
          data: dados.map(item => item.receitas),
          borderColor: '#16a34a',
          backgroundColor: '#bbf7d0',
          tension: 0.35,
          fill: false
        },
        {
          label: 'Despesas',
          data: dados.map(item => item.despesas),
          borderColor: '#dc2626',
          backgroundColor: '#fecaca',
          tension: 0.35,
          fill: false
        },
        {
          label: 'Lucro bruto',
          data: dados.map(item => item.lucroBruto),
          borderColor: '#2563eb',
          backgroundColor: '#bfdbfe',
          tension: 0.35,
          fill: false,
          borderDash: [6, 4]
        }
      ]
    };
  }

  private prepararIndicadores(lancamentos: LancamentoFinanceiro[], resumo: DashboardResumo): void {
    const inicio = this.dataLocal(resumo.inicioMes);
    const fim = this.dataLocal(resumo.fimMes);
    const lancamentosDoMes = lancamentos.filter(l => {
      const data = this.dataLocal(l.dataLancamento);
      return data >= inicio && data <= fim && l.status !== 'CANCELADO';
    });
    const despesas = lancamentosDoMes.filter(l => l.tipo === 'DESPESA');
    const total = despesas.reduce((acc, item) => acc + item.valor, 0);
    const porCategoria = despesas.reduce<Record<string, number>>((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] ?? 0) + item.valor;
      return acc;
    }, {});

    this.totalDespesasMapeadas = total;
    this.despesasPorCategoria = Object.entries(porCategoria)
      .map(([categoria, valor]) => ({
        categoria,
        valor,
        percentual: total > 0 ? (valor / total) * 100 : 0
      }))
      .sort((a, b) => b.valor - a.valor);
    this.maioresDespesas = despesas
      .slice()
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
    this.margemLucro = resumo.receitaMes > 0 ? (resumo.lucroBrutoMes / resumo.receitaMes) * 100 : 0;
  }

  private renderGraficos(): void {
    if (!this.resumo || !this.despesasCanvas || !this.fluxoCanvas) return;
    this.despesasChart?.destroy();
    this.fluxoChart?.destroy();

    this.despesasChart = new Chart(this.despesasCanvas.nativeElement, this.configDespesas());
    this.fluxoChart = new Chart(this.fluxoCanvas.nativeElement, this.configFluxo(this.resumo));
  }

  private renderGraficoMensal(): void {
    if (!this.financeiroMensalChartData || !this.mensalCanvas) return;
    this.mensalChart?.destroy();
    this.mensalChart = new Chart(this.mensalCanvas.nativeElement, {
      type: 'line',
      data: this.financeiroMensalChartData,
      options: this.lineChartOptions
    });
  }

  private configDespesas(): ChartConfiguration<'doughnut'> {
    const labels = this.despesasPorCategoria.map(item => this.nomeCategoria(item.categoria));
    const valores = this.despesasPorCategoria.map(item => item.valor);
    return {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['Sem despesas'],
        datasets: [{
          data: valores.length ? valores : [1],
          backgroundColor: ['#245a67', '#e7a94b', '#c44848', '#1f8a5b', '#2f7382', '#b7781f', '#667985', '#91b7c2'],
          borderColor: '#ffffff',
          borderWidth: 4,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true } },
          tooltip: { callbacks: { label: context => this.tooltipMoeda(context.label, Number(context.raw)) } }
        }
      }
    };
  }

  private configFluxo(resumo: DashboardResumo): ChartConfiguration<'bar'> {
    return {
      type: 'bar',
      data: {
        labels: ['Receitas', 'Despesas'],
        datasets: [{
          label: 'Valor no mês',
          data: [resumo.receitaMes, resumo.despesaMes],
          backgroundColor: ['#22c55e', '#ef4444'],
          borderColor: ['#15803d', '#b91c1c'],
          borderWidth: 1,
          borderRadius: 10,
          maxBarThickness: 70
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: '#475569',
              font: { size: 13, weight: 'bold' }
            },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#64748b',
              callback: value => this.moedaSemCentavos(Number(value))
            },
            grid: { color: '#e2e8f0' }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: context => this.moeda(Number(context.raw ?? 0)) } }
        }
      }
    };
  }

  private tooltipMoeda(labelText: string | undefined, valor: number): string {
    return `${labelText ?? 'Valor'}: ${this.moeda(valor)}`;
  }

  private moeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  }

  private moedaSemCentavos(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(valor);
  }

  private dataLocal(data: string): Date {
    return new Date(`${data.slice(0, 10)}T00:00:00`);
  }
}

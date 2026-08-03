import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { VeiculosComponent } from './features/veiculos/veiculos.component';
import { MotoristasComponent } from './features/motoristas/motoristas.component';
import { ClientesComponent } from './features/clientes/clientes.component';
import { OrdensServicoComponent } from './features/ordens-servico/ordens-servico.component';
import { FinanceiroComponent } from './features/financeiro/financeiro.component';
import { AbastecimentosComponent } from './features/abastecimentos/abastecimentos.component';
import { ManutencoesComponent } from './features/manutencoes/manutencoes.component';
import { DocumentosVeiculosComponent } from './features/documentos-veiculos/documentos-veiculos.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },

  /*
   * Relatório fora do AdminLayout.
   * Assim menu lateral e cabeçalho não aparecem na impressão.
   */
  {
    path: 'ordens-servico/:id/relatorio',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './features/ordem-servico-relatorio/ordem-servico-relatorio.component'
      ).then(
        componente => componente.OrdemServicoRelatorioComponent
      )
  },

  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'veiculos',
        component: VeiculosComponent
      },
      {
        path: 'motoristas',
        component: MotoristasComponent
      },
      {
        path: 'clientes',
        component: ClientesComponent
      },
      {
        path: 'ordens-servico',
        component: OrdensServicoComponent
      },
      {
        path: 'financeiro',
        component: FinanceiroComponent
      },
      {
        path: 'abastecimentos',
        component: AbastecimentosComponent
      },
      {
        path: 'manutencoes',
        component: ManutencoesComponent
      },
      {
        path: 'documentos-veiculos',
        component: DocumentosVeiculosComponent
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
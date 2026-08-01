# ERP Auto Reboque Torá - Frontend Angular

Frontend do sistema **ERP Auto Reboque Torá**, desenvolvido em Angular para controle operacional e financeiro de uma empresa de auto reboque/guincho.

O projeto foi criado para consumir uma API REST em **Java Spring Boot**, com autenticação JWT, controle de veículos, motoristas, clientes, ordens de serviço, financeiro, abastecimentos, manutenções, documentos da frota e dashboard gerencial.

---

## Visão Geral

O ERP tem como objetivo centralizar a gestão da operação de uma empresa de reboque, facilitando o acompanhamento de:

- Frota de veículos
- Motoristas
- Clientes
- Ordens de serviço
- Receitas e despesas
- Abastecimentos
- Manutenções
- Documentos dos veículos
- Indicadores gerenciais no dashboard

O sistema possui layout administrativo, autenticação com JWT, menus laterais, telas responsivas, formulários objetivos e gráficos para análise rápida da operação.

---

## Tecnologias Utilizadas

- Angular
- TypeScript
- HTML5
- CSS3
- RxJS
- Angular Router
- Reactive Forms
- Chart.js
- ng2-charts
- JWT Authentication
- API REST Spring Boot

---

## Funcionalidades

### Autenticação

- Tela de login
- Armazenamento de token JWT
- Interceptor para envio automático do token
- Proteção de rotas com AuthGuard
- Logout

### Dashboard

- Cards de resumo operacional
- Total de veículos
- Veículos disponíveis
- Veículos em manutenção
- Total de motoristas
- Total de clientes
- Receita do mês
- Despesa do mês
- Lucro bruto
- Documentos vencidos
- Gráficos com Chart.js

### Veículos

- Listagem de veículos
- Cadastro de veículo
- Edição de veículo
- Exclusão de veículo
- Controle de status
- Controle de quilometragem

### Motoristas

- Listagem de motoristas
- Cadastro de motorista
- Edição de motorista
- Exclusão de motorista
- Controle de CNH, categoria e validade

### Clientes

- Listagem de clientes
- Cadastro de cliente
- Edição de cliente
- Exclusão de cliente
- Controle por tipo de cliente

### Ordens de Serviço

- Cadastro de ordem de serviço
- Listagem de ordens
- Controle de status
- Iniciar atendimento
- Concluir atendimento
- Faturar ordem de serviço
- Cancelar ordem de serviço
- Integração com o financeiro

### Financeiro

- Listagem de lançamentos financeiros
- Cadastro de receita ou despesa
- Marcar lançamento como pago
- Cancelar lançamento
- Resumo financeiro por período
- Integração automática com ordens de serviço, abastecimentos, manutenções e documentos

### Abastecimentos

- Cadastro de abastecimento
- Listagem de abastecimentos
- Vínculo com veículo e motorista
- Cálculo automático do valor total
- Geração automática de despesa de diesel

### Manutenções

- Cadastro de manutenção
- Iniciar manutenção
- Concluir manutenção
- Cancelar manutenção
- Geração automática de despesa de manutenção
- Atualização de status do veículo

### Documentação dos Veículos

- Cadastro de documentos da frota
- Controle de vencimento
- Status: válido, a vencer, vencido e cancelado
- Geração automática de despesa de documentação
- Consulta por veículo e por status

---

## Estrutura do Projeto

```text
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── models/
│   │   └── services/
│   │
│   ├── features/
│   │   ├── abastecimentos/
│   │   ├── clientes/
│   │   ├── dashboard/
│   │   ├── documentos-veiculos/
│   │   ├── financeiro/
│   │   ├── login/
│   │   ├── manutencoes/
│   │   ├── motoristas/
│   │   ├── ordens-servico/
│   │   └── veiculos/
│   │
│   ├── layout/
│   │   └── admin-layout/
│   │
│   └── shared/
│
├── assets/
├── environments/
└── styles.css
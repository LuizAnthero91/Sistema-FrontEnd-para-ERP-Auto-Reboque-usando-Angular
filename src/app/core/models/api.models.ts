export interface ApiErrorCampo {
  campo: string;
  mensagem: string;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  erro: string;
  mensagem: string;
  path: string;
  campos: ApiErrorCampo[];
}

/* =========================================================
   AUTENTICAÇÃO
========================================================= */

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
  jwt?: string;
  tipo?: string;
  expiresIn?: number;
}

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

/* =========================================================
   VEÍCULOS DA FROTA
========================================================= */

export type StatusVeiculo =
  | 'DISPONIVEL'
  | 'EM_ATENDIMENTO'
  | 'EM_MANUTENCAO'
  | 'INATIVO';

export type TipoVeiculo =
  | 'GUINCHO_LEVE'
  | 'GUINCHO_PESADO'
  | 'CAMINHAO'
  | 'ONIBUS'
  | 'MAQUINA'
  | 'MOTO';

export interface Veiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano?: number;
  tipo: TipoVeiculo;
  status: StatusVeiculo;
  kmAtual: number;
  observacao?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type VeiculoRequest = Omit<
  Veiculo,
  'id' | 'criadoEm' | 'atualizadoEm'
>;

/* =========================================================
   MOTORISTAS
========================================================= */

export type StatusMotorista =
  | 'ATIVO'
  | 'INATIVO'
  | 'AFASTADO';

export interface Motorista {
  id: number;
  nome: string;
  cpf?: string;
  telefone?: string;
  cnh?: string;
  categoriaCnh?: string;
  validadeCnh?: string;
  status: StatusMotorista;
  observacao?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type MotoristaRequest = Omit<
  Motorista,
  'id' | 'criadoEm' | 'atualizadoEm'
>;

/* =========================================================
   CLIENTES
========================================================= */

export type TipoCliente =
  | 'PARTICULAR'
  | 'EMPRESA'
  | 'SEGURADORA'
  | 'OFICINA'
  | 'TRANSPORTADORA'
  | 'OUTRO';

export type StatusCliente =
  | 'ATIVO'
  | 'INATIVO';

export interface Cliente {
  id: number;
  nome: string;
  documento?: string;
  telefone?: string;
  email?: string;
  tipo: TipoCliente;
  status: StatusCliente;
  endereco?: string;
  observacao?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export type ClienteRequest = Omit<
  Cliente,
  'id' | 'criadoEm' | 'atualizadoEm'
>;

/* =========================================================
   ORDENS DE SERVIÇO
========================================================= */

export type TipoServico =
  | 'REMOCAO_VEICULO_LEVE'
  | 'REMOCAO_VEICULO_PESADO'
  | 'TRANSPORTE_MAQUINA'
  | 'TRANSPORTE_MOTO'
  | 'SOCORRO_MECANICO'
  | 'SERVICO_PARTICULAR'
  | 'SERVICO_SEGURADORA'
  | 'OUTRO';

export type StatusOrdemServico =
  | 'ABERTA'
  | 'AGENDADA'
  | 'EM_ATENDIMENTO'
  | 'CONCLUIDA'
  | 'CANCELADA'
  | 'FATURADA';

export interface OrdemServico {
  id: number;
  numeroOs: number;

  clienteId: number;
  clienteNome: string;

  /*
   * Veículo da frota utilizado pela empresa.
   * Exemplo: o guincho.
   */
  veiculoId?: number;
  veiculoPlaca?: string;
  veiculoModelo?: string;

  motoristaId?: number;
  motoristaNome?: string;

  tipoServico: TipoServico;
  status: StatusOrdemServico;

  origem: string;
  destino?: string;

  /*
   * Dados internos da operação.
   * Não serão mostrados na OS impressa.
   */
  kmEstimado?: number;
  kmReal?: number;

  valorCobrado: number;
  custoEstimado: number;

  dataAbertura?: string;
  dataConclusao?: string;

  observacao?: string;

  /*
   * Veículo atendido, pertencente ao cliente.
   */
  veiculoClientePlaca?: string;
  veiculoClienteMarca?: string;
  veiculoClienteModelo?: string;
  veiculoClienteCor?: string;
  veiculoClienteAno?: number;
  veiculoClienteKm?: number;
  veiculoClienteObservacao?: string;
}

export interface OrdemServicoRequest {
  clienteId: number;

  /*
   * Veículo da frota da empresa.
   */
  veiculoId?: number | null;

  motoristaId?: number | null;

  tipoServico: TipoServico;
  status?: StatusOrdemServico | null;

  origem: string;
  destino?: string;

  kmEstimado?: number | null;
  kmReal?: number | null;

  valorCobrado?: number | null;
  custoEstimado?: number | null;

  observacao?: string;

  /*
   * Veículo atendido do cliente.
   */
  veiculoClientePlaca?: string;
  veiculoClienteMarca?: string;
  veiculoClienteModelo?: string;
  veiculoClienteCor?: string;
  veiculoClienteAno?: number | null;
  veiculoClienteKm?: number | null;
  veiculoClienteObservacao?: string;
}

/* =========================================================
   FINANCEIRO
========================================================= */

export type TipoLancamento =
  | 'RECEITA'
  | 'DESPESA';

export type CategoriaFinanceira =
  | 'SERVICO_GUINCHO'
  | 'DIESEL'
  | 'MANUTENCAO'
  | 'DOCUMENTACAO'
  | 'PEDAGIO'
  | 'MULTA'
  | 'SEGURO'
  | 'SALARIO'
  | 'IMPOSTO'
  | 'OUTROS';

export type StatusPagamento =
  | 'PENDENTE'
  | 'PAGO'
  | 'CANCELADO';

export interface LancamentoFinanceiro {
  id: number;
  veiculoId?: number;
  veiculoPlaca?: string;
  ordemServicoId?: number;
  tipo: TipoLancamento;
  categoria: CategoriaFinanceira;
  status: StatusPagamento;
  descricao: string;
  valor: number;
  dataLancamento: string;
  observacao?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface LancamentoFinanceiroRequest {
  veiculoId?: number | null;
  ordemServicoId?: number | null;
  tipo: TipoLancamento;
  categoria: CategoriaFinanceira;
  status?: StatusPagamento | null;
  descricao: string;
  valor: number;
  dataLancamento: string;
  observacao?: string;
}

export interface ResumoFinanceiro {
  inicio: string;
  fim: string;
  receitas: number;
  despesas: number;
  lucroBruto: number;
}

/* =========================================================
   ABASTECIMENTOS
========================================================= */

export interface Abastecimento {
  id: number;
  veiculoId: number;
  veiculoPlaca: string;
  veiculoModelo: string;
  motoristaId?: number;
  motoristaNome?: string;
  dataAbastecimento: string;
  kmAtual: number;
  litros: number;
  valorLitro: number;
  valorTotal: number;
  posto?: string;
  observacao?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface AbastecimentoRequest {
  veiculoId: number;
  motoristaId?: number | null;
  dataAbastecimento: string;
  kmAtual: number;
  litros: number;
  valorLitro: number;
  posto?: string;
  observacao?: string;
}

/* =========================================================
   MANUTENÇÕES
========================================================= */

export type TipoManutencao =
  | 'PREVENTIVA'
  | 'CORRETIVA'
  | 'REVISAO'
  | 'TROCA_OLEO'
  | 'PNEUS'
  | 'FREIOS'
  | 'ELETRICA'
  | 'MECANICA'
  | 'GUINCHO'
  | 'OUTROS';

export type StatusManutencao =
  | 'ABERTA'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDA'
  | 'CANCELADA';

export interface Manutencao {
  id: number;
  veiculoId: number;
  veiculoPlaca: string;
  veiculoModelo: string;
  tipo: TipoManutencao;
  status: StatusManutencao;
  dataManutencao: string;
  kmAtual?: number;
  descricao: string;
  oficina?: string;
  custoPecas: number;
  custoMaoObra: number;
  custoTotal: number;
  proximaManutencaoKm?: number;
  proximaManutencaoData?: string;
  observacao?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface ManutencaoRequest {
  veiculoId: number;
  tipo: TipoManutencao;
  status?: StatusManutencao | null;
  dataManutencao: string;
  kmAtual?: number | null;
  descricao: string;
  oficina?: string;
  custoPecas?: number | null;
  custoMaoObra?: number | null;
  proximaManutencaoKm?: number | null;
  proximaManutencaoData?: string | null;
  observacao?: string;
}

/* =========================================================
   DOCUMENTOS DE VEÍCULOS
========================================================= */

export type TipoDocumentoVeiculo =
  | 'CRLV'
  | 'IPVA'
  | 'SEGURO'
  | 'LICENCIAMENTO'
  | 'ANTT'
  | 'TACOGRAFO'
  | 'VISTORIA'
  | 'ALVARA'
  | 'OUTROS';

export type StatusDocumentoVeiculo =
  | 'VALIDO'
  | 'A_VENCER'
  | 'VENCIDO'
  | 'CANCELADO';

export interface DocumentoVeiculo {
  id: number;
  veiculoId: number;
  veiculoPlaca: string;
  veiculoModelo: string;
  tipo: TipoDocumentoVeiculo;
  status: StatusDocumentoVeiculo;
  numeroDocumento?: string;
  dataEmissao?: string;
  dataVencimento: string;
  valor: number;
  orgaoEmissor?: string;
  arquivoUrl?: string;
  despesaGerada: boolean;
  observacao?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

export interface DocumentoVeiculoRequest {
  veiculoId: number;
  tipo: TipoDocumentoVeiculo;
  status?: StatusDocumentoVeiculo | null;
  numeroDocumento?: string;
  dataEmissao?: string | null;
  dataVencimento: string;
  valor?: number | null;
  orgaoEmissor?: string;
  arquivoUrl?: string;
  observacao?: string;
}

/* =========================================================
   DASHBOARD
========================================================= */

export interface DashboardResumo {
  inicioMes: string;
  fimMes: string;

  totalVeiculos: number;
  veiculosDisponiveis: number;
  veiculosEmAtendimento: number;
  veiculosEmManutencao: number;
  veiculosInativos: number;

  totalMotoristas: number;
  totalClientes: number;

  ordensAbertas: number;
  ordensAgendadas: number;
  ordensEmAtendimento: number;
  ordensConcluidas: number;
  ordensFaturadas: number;
  ordensCanceladas: number;

  manutencoesAbertas: number;
  manutencoesEmAndamento: number;
  manutencoesConcluidas: number;

  documentosVencidos: number;
  documentosAVencer: number;

  receitaMes: number;
  despesaMes: number;
  lucroBrutoMes: number;
}

export interface DashboardFinanceiroMensal {
  ano: number;
  mes: number;
  nomeMes: string;
  receitas: number;
  despesas: number;
  lucroBruto: number;
}

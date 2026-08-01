export const tipoVeiculoOptions = ['GUINCHO_LEVE','GUINCHO_PESADO','CAMINHAO','ONIBUS','MAQUINA','MOTO'];
export const statusVeiculoOptions = ['DISPONIVEL','EM_ATENDIMENTO','EM_MANUTENCAO','INATIVO'];
export const statusMotoristaOptions = ['ATIVO','INATIVO','AFASTADO'];
export const tipoClienteOptions = ['PARTICULAR','EMPRESA','SEGURADORA','OFICINA','TRANSPORTADORA','OUTRO'];
export const statusClienteOptions = ['ATIVO','INATIVO'];
export const tipoServicoOptions = ['REMOCAO_VEICULO_LEVE','REMOCAO_VEICULO_PESADO','TRANSPORTE_MAQUINA','TRANSPORTE_MOTO','SOCORRO_MECANICO','SERVICO_PARTICULAR','SERVICO_SEGURADORA','OUTRO'];
export const statusOrdemOptions = ['ABERTA','AGENDADA','EM_ATENDIMENTO','CONCLUIDA','CANCELADA','FATURADA'];
export const tipoLancamentoOptions = ['RECEITA','DESPESA'];
export const categoriaFinanceiraOptions = ['SERVICO_GUINCHO','DIESEL','MANUTENCAO','DOCUMENTACAO','PEDAGIO','MULTA','SEGURO','SALARIO','IMPOSTO','OUTROS'];
export const statusPagamentoOptions = ['PENDENTE','PAGO','CANCELADO'];
export const tipoManutencaoOptions = ['PREVENTIVA','CORRETIVA','REVISAO','TROCA_OLEO','PNEUS','FREIOS','ELETRICA','MECANICA','GUINCHO','OUTROS'];
export const statusManutencaoOptions = ['ABERTA','EM_ANDAMENTO','CONCLUIDA','CANCELADA'];
export const tipoDocumentoOptions = ['CRLV','IPVA','SEGURO','LICENCIAMENTO','ANTT','TACOGRAFO','VISTORIA','ALVARA','OUTROS'];
export const statusDocumentoOptions = ['VALIDO','A_VENCER','VENCIDO','CANCELADO'];

export function label(value?: string | null): string {
  return value ? value.replaceAll('_', ' ') : '-';
}

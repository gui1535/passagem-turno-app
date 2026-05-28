import type {
  Empresa,
  EntidadeHistorico,
  SituacaoAtividade,
  TipoManutencaoTurno,
} from '@/src/domain/enums';

export type Turno = {
  id: string;
  data: string;
  horaInicio?: string;
  horaFim?: string;
  localizacao: string;
  descricaoAtividadeDoDia: string;
  tiposManutencao: TipoManutencaoTurno[];
  createdAt: string;
  updatedAt: string;
};

export type Responsavel = {
  id: string;
  turnoId: string;
  nome: string;
  empresa: Empresa;
  empresaOutra?: string;
};

export type Atividade = {
  id: string;
  turnoId: string;
  numeroAtividade?: string;
  local: string;
  situacao: SituacaoAtividade;
  tituloDefeito: string;
  descricaoDefeito: string;
  acoesRealizadas: string;
  nomeRegistrou: string;
  nomeEditou?: string;
  createdAt: string;
  updatedAt: string;
};

export type ImagemAtividade = {
  id: string;
  atividadeId: string;
  uri: string;
  legenda?: string;
  createdAt: string;
};

export type HistoricoEdicao = {
  id: string;
  entidade: EntidadeHistorico;
  entidadeId: string;
  quemAlterou: string;
  quando: string;
  campoAlterado: string;
  valorAnterior: string;
  novoValor: string;
};

export type ModeloTexto = {
  id: string;
  tituloModelo: string;
  tituloDefeitoPadrao: string;
  descricaoPadrao: string;
  acoesComunsPadrao: string;
};

export type ConfiguracaoApp = {
  nomeTurno: string;
  horaInicioPadrao?: string;
  horaFimPadrao?: string;
  localizacaoPadrao: string;
};

export type PessoaPadrao = {
  id: string;
  nome: string;
  empresa: Responsavel['empresa'];
  empresaOutra?: string;
};

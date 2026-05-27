import type {
  Empresa,
  EntidadeHistorico,
  SituacaoFalha,
  StatusFalha,
  StatusTurno,
} from '@/src/domain/enums';

export type Turno = {
  id: string;
  data: string;
  horaInicio?: string;
  horaFim?: string;
  localizacao: string;
  descricaoAtividadeDoDia: string;
  status: StatusTurno;
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

export type FalhaAtividade = {
  id: string;
  turnoId: string;
  numeroFalha?: string;
  local: string;
  situacao: SituacaoFalha;
  status: StatusFalha;
  tituloDefeito: string;
  descricaoDefeito: string;
  acoesRealizadas: string;
  proximoTurnoAcompanhar: boolean;
  nomeRegistrou: string;
  nomeEditou?: string;
  createdAt: string;
  updatedAt: string;
};

export type ImagemFalha = {
  id: string;
  falhaId: string;
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

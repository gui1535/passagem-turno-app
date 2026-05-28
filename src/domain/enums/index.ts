export enum Empresa {
  CPTM = 'CPTM',
  Trivia = 'Trivia',
  Alstom = 'Alstom',
  Siemens = 'Siemens',
  Outros = 'Outros',
  Outra = 'Outra',
}

export enum SituacaoAtividade {
  OK = 'OK',
  NOK = 'NOK',
  Pendente = 'Pendente',
}

export enum StatusAtividade {
  Aberta = 'Aberta',
  EmAtendimento = 'Em atendimento',
  Normalizada = 'Normalizada',
  Pendente = 'Pendente',
}

export enum StatusTurno {
  Rascunho = 'Rascunho',
  EmAndamento = 'Em andamento',
  Finalizado = 'Finalizado',
}

export enum TipoManutencaoTurno {
  Corretiva = 'Corretiva',
  Preventiva = 'Preventiva',
  Estudos = 'Estudos',
  Acompanhamento = 'Acompanhamento',
}

export enum EntidadeHistorico {
  Turno = 'Turno',
  Responsavel = 'Responsavel',
  Atividade = 'Atividade',
  ImagemAtividade = 'ImagemAtividade',
}

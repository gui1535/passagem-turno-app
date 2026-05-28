export enum Empresa {
  CPTM = 'CPTM',
  Trivia = 'Trivia',
  Alstom = 'Alstom',
  Siemens = 'Siemens',
  Outros = 'Outros',
  Outra = 'Outra',
}

export enum SituacaoFalha {
  OK = 'OK',
  NOK = 'NOK',
  Pendente = 'Pendente',
}

export enum StatusFalha {
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
  FalhaAtividade = 'FalhaAtividade',
  ImagemFalha = 'ImagemFalha',
}

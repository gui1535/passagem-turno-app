export enum TipoAtividade {
  Corretiva = 'Corretiva',
  Preventiva = 'Preventiva',
  Estudos = 'Estudos',
  Acompanhamento = 'Acompanhamento',
  Outros = 'Outros',
}

export enum Empresa {
  CPTM = 'CPTM',
  Trivia = 'Trivia',
  Alstom = 'Alstom',
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

export enum Prioridade {
  Baixa = 'Baixa',
  Media = 'Média',
  Alta = 'Alta',
}

export enum StatusTurno {
  Rascunho = 'Rascunho',
  EmAndamento = 'Em andamento',
  Finalizado = 'Finalizado',
}

export enum EntidadeHistorico {
  Turno = 'Turno',
  Responsavel = 'Responsavel',
  FalhaAtividade = 'FalhaAtividade',
  ImagemFalha = 'ImagemFalha',
}

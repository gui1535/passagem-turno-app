import type { HistoricoEdicao } from '@/src/domain/types';
import { pegarBanco } from '@/src/data/database';
import { agoraIso, criarId } from '@/src/utils/geral';

type LinhaHistorico = {
  id: string;
  entidade: string;
  entidade_id: string;
  quem_alterou: string;
  quando: string;
  campo_alterado: string;
  valor_anterior: string;
  novo_valor: string;
};

function mapearHistorico(l: LinhaHistorico): HistoricoEdicao {
  return {
    id: l.id,
    entidade: l.entidade as HistoricoEdicao['entidade'],
    entidadeId: l.entidade_id,
    quemAlterou: l.quem_alterou,
    quando: l.quando,
    campoAlterado: l.campo_alterado,
    valorAnterior: l.valor_anterior,
    novoValor: l.novo_valor,
  };
}

export async function listarHistorico(entidade: HistoricoEdicao['entidade'], entidadeId: string) {
  const db = pegarBanco();
  const linhas = await db.getAllAsync<LinhaHistorico>(
    `SELECT * FROM historico_edicao WHERE entidade = ? AND entidade_id = ? ORDER BY quando DESC;`,
    entidade,
    entidadeId
  );
  return linhas.map(mapearHistorico);
}

export async function registrarHistorico(dados: Omit<HistoricoEdicao, 'id' | 'quando'>) {
  const db = pegarBanco();
  const item: HistoricoEdicao = { ...dados, id: criarId(), quando: agoraIso() };

  await db.runAsync(
    `INSERT INTO historico_edicao (
      id, entidade, entidade_id, quem_alterou, quando, campo_alterado, valor_anterior, novo_valor
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    item.id,
    item.entidade,
    item.entidadeId,
    item.quemAlterou,
    item.quando,
    item.campoAlterado,
    item.valorAnterior,
    item.novoValor
  );

  return item;
}


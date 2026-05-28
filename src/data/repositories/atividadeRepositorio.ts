import type { Atividade } from '@/src/domain/types';
import { pegarBanco } from '@/src/data/database';
import { agoraIso, criarId } from '@/src/utils/geral';

type LinhaAtividade = {
  id: string;
  turno_id: string;
  numero_falha: string | null;
  local: string;
  situacao: string;
  titulo_defeito: string;
  descricao_defeito: string;
  acoes_realizadas: string;
  nome_registrou: string;
  nome_editou: string | null;
  created_at: string;
  updated_at: string;
};

function mapearAtividade(l: LinhaAtividade): Atividade {
  return {
    id: l.id,
    turnoId: l.turno_id,
    numeroAtividade: l.numero_falha ?? undefined,
    local: l.local,
    situacao: l.situacao as Atividade['situacao'],
    tituloDefeito: l.titulo_defeito,
    descricaoDefeito: l.descricao_defeito,
    acoesRealizadas: l.acoes_realizadas,
    nomeRegistrou: l.nome_registrou,
    nomeEditou: l.nome_editou ?? undefined,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
  };
}

export type FiltrosAtividade = Partial<{
  situacao: Atividade['situacao'];
  local: string;
  nomeRegistrou: string;
}>;

export async function listarAtividades(turnoId: string, filtros?: FiltrosAtividade) {
  const db = pegarBanco();

  const where: string[] = ['turno_id = ?'];
  const args: (string | number | null)[] = [turnoId];

  if (filtros?.situacao) {
    where.push('situacao = ?');
    args.push(filtros.situacao);
  }
  if (filtros?.local) {
    where.push('local = ?');
    args.push(filtros.local);
  }
  if (filtros?.nomeRegistrou) {
    where.push('nome_registrou = ?');
    args.push(filtros.nomeRegistrou);
  }

  const linhas = await db.getAllAsync<LinhaAtividade>(
    `SELECT * FROM falhas_atividades WHERE ${where.join(' AND ')} ORDER BY updated_at DESC;`,
    ...args
  );
  return linhas.map(mapearAtividade);
}

export async function pegarAtividadePorId(id: string) {
  const db = pegarBanco();
  const linha = await db.getFirstAsync<LinhaAtividade>(
    `SELECT * FROM falhas_atividades WHERE id = ? LIMIT 1;`,
    id
  );
  return linha ? mapearAtividade(linha) : null;
}

export async function criarAtividade(dados: Omit<Atividade, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = pegarBanco();
  const agora = agoraIso();
  const item: Atividade = {
    ...dados,
    id: criarId(),
    createdAt: agora,
    updatedAt: agora,
  };

  await db.runAsync(
    `INSERT INTO falhas_atividades (
      id, turno_id, numero_falha, local, situacao,
      titulo_defeito, descricao_defeito, acoes_realizadas,
      nome_registrou, nome_editou,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    item.id,
    item.turnoId,
    item.numeroAtividade ?? null,
    item.local,
    item.situacao,
    item.tituloDefeito,
    item.descricaoDefeito,
    item.acoesRealizadas,
    item.nomeRegistrou,
    item.nomeEditou ?? null,
    item.createdAt,
    item.updatedAt
  );

  return item;
}

export async function atualizarAtividade(item: Atividade) {
  const db = pegarBanco();
  const atualizado: Atividade = { ...item, updatedAt: agoraIso() };

  await db.runAsync(
    `UPDATE falhas_atividades SET
      numero_falha = ?,
      local = ?,
      situacao = ?,
      titulo_defeito = ?,
      descricao_defeito = ?,
      acoes_realizadas = ?,
      nome_registrou = ?,
      nome_editou = ?,
      updated_at = ?
    WHERE id = ?;`,
    atualizado.numeroAtividade ?? null,
    atualizado.local,
    atualizado.situacao,
    atualizado.tituloDefeito,
    atualizado.descricaoDefeito,
    atualizado.acoesRealizadas,
    atualizado.nomeRegistrou,
    atualizado.nomeEditou ?? null,
    atualizado.updatedAt,
    atualizado.id
  );
}

export async function removerAtividade(id: string) {
  const db = pegarBanco();
  await db.runAsync(`DELETE FROM falhas_atividades WHERE id = ?;`, id);
}

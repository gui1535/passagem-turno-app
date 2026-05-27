import type { FalhaAtividade } from '@/src/domain/types';
import { pegarBanco } from '@/src/data/database';
import { agoraIso, criarId } from '@/src/utils/geral';

type LinhaFalha = {
  id: string;
  turno_id: string;
  numero_falha: string | null;
  local: string;
  situacao: string;
  status: string;
  titulo_defeito: string;
  descricao_defeito: string;
  acoes_realizadas: string;
  proximo_turno_acompanhar: number;
  nome_registrou: string;
  nome_editou: string | null;
  created_at: string;
  updated_at: string;
};

function mapearFalha(l: LinhaFalha): FalhaAtividade {
  return {
    id: l.id,
    turnoId: l.turno_id,
    numeroFalha: l.numero_falha ?? undefined,
    local: l.local,
    situacao: l.situacao as FalhaAtividade['situacao'],
    status: l.status as FalhaAtividade['status'],
    tituloDefeito: l.titulo_defeito,
    descricaoDefeito: l.descricao_defeito,
    acoesRealizadas: l.acoes_realizadas,
    proximoTurnoAcompanhar: !!l.proximo_turno_acompanhar,
    nomeRegistrou: l.nome_registrou,
    nomeEditou: l.nome_editou ?? undefined,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
  };
}

export type FiltrosFalha = Partial<{
  situacao: FalhaAtividade['situacao'];
  status: FalhaAtividade['status'];
  local: string;
  nomeRegistrou: string;
}>;

export async function listarFalhas(turnoId: string, filtros?: FiltrosFalha) {
  const db = pegarBanco();

  const where: string[] = ['turno_id = ?'];
  const args: any[] = [turnoId];

  if (filtros?.situacao) {
    where.push('situacao = ?');
    args.push(filtros.situacao);
  }
  if (filtros?.status) {
    where.push('status = ?');
    args.push(filtros.status);
  }
  if (filtros?.local) {
    where.push('local = ?');
    args.push(filtros.local);
  }
  if (filtros?.nomeRegistrou) {
    where.push('nome_registrou = ?');
    args.push(filtros.nomeRegistrou);
  }

  const linhas = await db.getAllAsync<LinhaFalha>(
    `SELECT * FROM falhas_atividades WHERE ${where.join(' AND ')} ORDER BY updated_at DESC;`,
    ...args
  );
  return linhas.map(mapearFalha);
}

export async function pegarFalhaPorId(id: string) {
  const db = pegarBanco();
  const linha = await db.getFirstAsync<LinhaFalha>(
    `SELECT * FROM falhas_atividades WHERE id = ? LIMIT 1;`,
    id
  );
  return linha ? mapearFalha(linha) : null;
}

export async function criarFalha(
  dados: Omit<FalhaAtividade, 'id' | 'createdAt' | 'updatedAt'>
) {
  const db = pegarBanco();
  const agora = agoraIso();
  const item: FalhaAtividade = {
    ...dados,
    id: criarId(),
    createdAt: agora,
    updatedAt: agora,
  };

  await db.runAsync(
    `INSERT INTO falhas_atividades (
      id, turno_id, numero_falha, local, situacao, status,
      titulo_defeito, descricao_defeito, acoes_realizadas,
      proximo_turno_acompanhar, nome_registrou, nome_editou,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    item.id,
    item.turnoId,
    item.numeroFalha ?? null,
    item.local,
    item.situacao,
    item.status,
    item.tituloDefeito,
    item.descricaoDefeito,
    item.acoesRealizadas,
    item.proximoTurnoAcompanhar ? 1 : 0,
    item.nomeRegistrou,
    item.nomeEditou ?? null,
    item.createdAt,
    item.updatedAt
  );

  return item;
}

export async function atualizarFalha(item: FalhaAtividade) {
  const db = pegarBanco();
  const atualizado: FalhaAtividade = { ...item, updatedAt: agoraIso() };

  await db.runAsync(
    `UPDATE falhas_atividades SET
      numero_falha = ?,
      local = ?,
      situacao = ?,
      status = ?,
      titulo_defeito = ?,
      descricao_defeito = ?,
      acoes_realizadas = ?,
      proximo_turno_acompanhar = ?,
      nome_registrou = ?,
      nome_editou = ?,
      updated_at = ?
    WHERE id = ?;`,
    atualizado.numeroFalha ?? null,
    atualizado.local,
    atualizado.situacao,
    atualizado.status,
    atualizado.tituloDefeito,
    atualizado.descricaoDefeito,
    atualizado.acoesRealizadas,
    atualizado.proximoTurnoAcompanhar ? 1 : 0,
    atualizado.nomeRegistrou,
    atualizado.nomeEditou ?? null,
    atualizado.updatedAt,
    atualizado.id
  );
}

export async function removerFalha(id: string) {
  const db = pegarBanco();
  await db.runAsync(`DELETE FROM falhas_atividades WHERE id = ?;`, id);
}

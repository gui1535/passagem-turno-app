import type { Responsavel } from '@/src/domain/types';
import { pegarBanco } from '@/src/data/database';
import { criarId } from '@/src/utils/geral';

type LinhaResponsavel = {
  id: string;
  turno_id: string;
  nome: string;
  empresa: string;
  empresa_outra: string | null;
};

function mapearResponsavel(l: LinhaResponsavel): Responsavel {
  return {
    id: l.id,
    turnoId: l.turno_id,
    nome: l.nome,
    empresa: l.empresa as Responsavel['empresa'],
    empresaOutra: l.empresa_outra ?? undefined,
  };
}

export async function listarResponsaveis(turnoId: string): Promise<Responsavel[]> {
  const db = pegarBanco();
  const linhas = await db.getAllAsync<LinhaResponsavel>(
    `SELECT * FROM responsaveis WHERE turno_id = ? ORDER BY nome ASC;`,
    turnoId
  );
  return linhas.map(mapearResponsavel);
}

export async function criarResponsavel(
  dados: Omit<Responsavel, 'id'>
): Promise<Responsavel> {
  const db = pegarBanco();
  const item: Responsavel = { ...dados, id: criarId() };

  await db.runAsync(
    `INSERT INTO responsaveis (id, turno_id, nome, empresa, empresa_outra)
     VALUES (?, ?, ?, ?, ?);`,
    item.id,
    item.turnoId,
    item.nome,
    item.empresa,
    item.empresaOutra ?? null
  );

  return item;
}

export async function atualizarResponsavel(item: Responsavel): Promise<void> {
  const db = pegarBanco();
  await db.runAsync(
    `UPDATE responsaveis SET nome = ?, empresa = ?, empresa_outra = ? WHERE id = ?;`,
    item.nome,
    item.empresa,
    item.empresaOutra ?? null,
    item.id
  );
}

export async function removerResponsavel(id: string): Promise<void> {
  const db = pegarBanco();
  await db.runAsync(`DELETE FROM responsaveis WHERE id = ?;`, id);
}


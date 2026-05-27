import type { Turno } from '@/src/domain/types';
import { StatusTurno } from '@/src/domain/enums';
import { pegarBanco } from '@/src/data/database';
import { agoraIso, criarId } from '@/src/utils/geral';

type LinhaTurno = {
  id: string;
  data: string;
  hora_inicio: string | null;
  hora_fim: string | null;
  localizacao: string;
  descricao_atividade_dia: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function mapearTurno(l: LinhaTurno): Turno {
  return {
    id: l.id,
    data: l.data,
    horaInicio: l.hora_inicio ?? undefined,
    horaFim: l.hora_fim ?? undefined,
    localizacao: l.localizacao,
    descricaoAtividadeDoDia: l.descricao_atividade_dia,
    status: l.status as Turno['status'],
    createdAt: l.created_at,
    updatedAt: l.updated_at,
  };
}

export async function listarTurnos(): Promise<Turno[]> {
  const db = pegarBanco();
  const linhas = await db.getAllAsync<LinhaTurno>(
    `SELECT * FROM turnos ORDER BY updated_at DESC;`
  );
  return linhas.map(mapearTurno);
}

export async function pegarTurnoPorId(id: string): Promise<Turno | null> {
  const db = pegarBanco();
  const linha = await db.getFirstAsync<LinhaTurno>(
    `SELECT * FROM turnos WHERE id = ? LIMIT 1;`,
    id
  );
  return linha ? mapearTurno(linha) : null;
}

export async function criarTurno(
  dados: Omit<Turno, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: StatusTurno }
): Promise<Turno> {
  const db = pegarBanco();
  const agora = agoraIso();
  const turno: Turno = {
    id: criarId(),
    status: dados.status ?? StatusTurno.Rascunho,
    createdAt: agora,
    updatedAt: agora,
    ...dados,
  };

  await db.runAsync(
    `INSERT INTO turnos (
      id, data, hora_inicio, hora_fim, localizacao, descricao_atividade_dia, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    turno.id,
    turno.data,
    turno.horaInicio ?? null,
    turno.horaFim ?? null,
    turno.localizacao,
    turno.descricaoAtividadeDoDia,
    turno.status,
    turno.createdAt,
    turno.updatedAt
  );

  return turno;
}

export async function atualizarTurno(turno: Turno): Promise<void> {
  const db = pegarBanco();
  const atualizado: Turno = { ...turno, updatedAt: agoraIso() };

  await db.runAsync(
    `UPDATE turnos SET
      data = ?,
      hora_inicio = ?,
      hora_fim = ?,
      localizacao = ?,
      descricao_atividade_dia = ?,
      status = ?,
      updated_at = ?
    WHERE id = ?;`,
    atualizado.data,
    atualizado.horaInicio ?? null,
    atualizado.horaFim ?? null,
    atualizado.localizacao,
    atualizado.descricaoAtividadeDoDia,
    atualizado.status,
    atualizado.updatedAt,
    atualizado.id
  );
}

export async function removerTurno(id: string): Promise<void> {
  const db = pegarBanco();
  await db.runAsync(`DELETE FROM turnos WHERE id = ?;`, id);
}


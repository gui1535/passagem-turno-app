import type { ImagemFalha } from '@/src/domain/types';
import { pegarBanco } from '@/src/data/database';
import { agoraIso, criarId } from '@/src/utils/geral';

type LinhaImagem = {
  id: string;
  falha_id: string;
  uri: string;
  legenda: string | null;
  created_at: string;
};

function mapearImagem(l: LinhaImagem): ImagemFalha {
  return {
    id: l.id,
    falhaId: l.falha_id,
    uri: l.uri,
    legenda: l.legenda ?? undefined,
    createdAt: l.created_at,
  };
}

export async function listarImagensDaFalha(falhaId: string) {
  const db = pegarBanco();
  const linhas = await db.getAllAsync<LinhaImagem>(
    `SELECT * FROM imagens_falha WHERE falha_id = ? ORDER BY created_at ASC;`,
    falhaId
  );
  return linhas.map(mapearImagem);
}

export async function criarImagemFalha(dados: Omit<ImagemFalha, 'id' | 'createdAt'>) {
  const db = pegarBanco();
  const item: ImagemFalha = { ...dados, id: criarId(), createdAt: agoraIso() };

  await db.runAsync(
    `INSERT INTO imagens_falha (id, falha_id, uri, legenda, created_at) VALUES (?, ?, ?, ?, ?);`,
    item.id,
    item.falhaId,
    item.uri,
    item.legenda ?? null,
    item.createdAt
  );

  return item;
}

export async function atualizarLegendaImagem(id: string, legenda?: string) {
  const db = pegarBanco();
  await db.runAsync(`UPDATE imagens_falha SET legenda = ? WHERE id = ?;`, legenda ?? null, id);
}

export async function removerImagem(id: string) {
  const db = pegarBanco();
  await db.runAsync(`DELETE FROM imagens_falha WHERE id = ?;`, id);
}


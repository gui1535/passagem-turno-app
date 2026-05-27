import type { ModeloTexto } from '@/src/domain/types';
import { pegarBanco } from '@/src/data/database';
import { criarId } from '@/src/utils/geral';

type LinhaModelo = {
  id: string;
  titulo_modelo: string;
  titulo_defeito_padrao: string;
  descricao_padrao: string;
  acoes_comuns_padrao: string;
};

function mapearModelo(l: LinhaModelo): ModeloTexto {
  return {
    id: l.id,
    tituloModelo: l.titulo_modelo,
    tituloDefeitoPadrao: l.titulo_defeito_padrao,
    descricaoPadrao: l.descricao_padrao,
    acoesComunsPadrao: l.acoes_comuns_padrao,
  };
}

export async function listarModelosTexto() {
  const db = pegarBanco();
  const linhas = await db.getAllAsync<LinhaModelo>(
    `SELECT * FROM modelos_texto ORDER BY titulo_modelo ASC;`
  );
  return linhas.map(mapearModelo);
}

export async function inserirModeloTexto(dados: Omit<ModeloTexto, 'id'>) {
  const db = pegarBanco();
  const item: ModeloTexto = { ...dados, id: criarId() };

  await db.runAsync(
    `INSERT INTO modelos_texto (id, titulo_modelo, titulo_defeito_padrao, descricao_padrao, acoes_comuns_padrao)
     VALUES (?, ?, ?, ?, ?);`,
    item.id,
    item.tituloModelo,
    item.tituloDefeitoPadrao,
    item.descricaoPadrao,
    item.acoesComunsPadrao
  );

  return item;
}

export async function contarModelosTexto() {
  const db = pegarBanco();
  const linha = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(1) as total FROM modelos_texto;`
  );
  return linha?.total ?? 0;
}


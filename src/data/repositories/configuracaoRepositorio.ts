import type { ConfiguracaoApp, PessoaPadrao } from '@/src/domain/types';
import { pegarBanco } from '@/src/data/database';
import { criarId } from '@/src/utils/geral';

type LinhaConfiguracao = {
  id: string;
  nome_turno: string;
  hora_inicio_padrao: string | null;
  hora_fim_padrao: string | null;
  localizacao_padrao: string;
};

type LinhaPessoa = {
  id: string;
  nome: string;
  empresa: string;
  empresa_outra: string | null;
};

function mapearConfiguracao(l: LinhaConfiguracao): ConfiguracaoApp {
  return {
    nomeTurno: l.nome_turno,
    horaInicioPadrao: l.hora_inicio_padrao ?? undefined,
    horaFimPadrao: l.hora_fim_padrao ?? undefined,
    localizacaoPadrao: l.localizacao_padrao,
  };
}

function mapearPessoa(l: LinhaPessoa): PessoaPadrao {
  return {
    id: l.id,
    nome: l.nome,
    empresa: l.empresa as PessoaPadrao['empresa'],
    empresaOutra: l.empresa_outra ?? undefined,
  };
}

export async function pegarConfiguracaoApp(): Promise<ConfiguracaoApp | null> {
  const db = pegarBanco();
  const linha = await db.getFirstAsync<LinhaConfiguracao>(
    `SELECT * FROM configuracao_app WHERE id = 'app' LIMIT 1;`
  );
  return linha ? mapearConfiguracao(linha) : null;
}

export async function salvarConfiguracaoApp(cfg: ConfiguracaoApp) {
  const db = pegarBanco();
  await db.runAsync(
    `INSERT INTO configuracao_app (id, nome_turno, hora_inicio_padrao, hora_fim_padrao, localizacao_padrao)
     VALUES ('app', ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       nome_turno = excluded.nome_turno,
       hora_inicio_padrao = excluded.hora_inicio_padrao,
       hora_fim_padrao = excluded.hora_fim_padrao,
       localizacao_padrao = excluded.localizacao_padrao;`,
    cfg.nomeTurno,
    cfg.horaInicioPadrao ?? null,
    cfg.horaFimPadrao ?? null,
    cfg.localizacaoPadrao
  );
}

export async function listarPessoasPadrao() {
  const db = pegarBanco();
  const linhas = await db.getAllAsync<LinhaPessoa>(`SELECT * FROM pessoas_padrao ORDER BY nome ASC;`);
  return linhas.map(mapearPessoa);
}

export async function adicionarPessoaPadrao(dados: Omit<PessoaPadrao, 'id'>) {
  const db = pegarBanco();
  const item: PessoaPadrao = { ...dados, id: criarId() };
  await db.runAsync(
    `INSERT INTO pessoas_padrao (id, nome, empresa, empresa_outra) VALUES (?, ?, ?, ?);`,
    item.id,
    item.nome,
    item.empresa,
    item.empresaOutra ?? null
  );
  return item;
}

export async function removerPessoaPadrao(id: string) {
  const db = pegarBanco();
  await db.runAsync(`DELETE FROM pessoas_padrao WHERE id = ?;`, id);
}


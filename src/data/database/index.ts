import * as SQLite from 'expo-sqlite';

// Banco local (SQLite)
export const NOME_BANCO = 'passagem_turno.db';
export const VERSAO_BANCO = 4;

let banco: SQLite.SQLiteDatabase | null = null;

export function pegarBanco() {
  if (!banco) {
    banco = SQLite.openDatabaseSync(NOME_BANCO);
  }
  return banco;
}

export async function iniciarBanco() {
  const db = pegarBanco();
  await db.execAsync('PRAGMA foreign_keys = ON;');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meta (
      chave TEXT PRIMARY KEY NOT NULL,
      valor TEXT NOT NULL
    );
  `);

  const versaoAtual = await pegarVersao(db);
  if (versaoAtual < 1) {
    await aplicarMigracaoV1(db);
  }
  if (versaoAtual < 2) {
    await aplicarMigracaoV2(db);
  }
  if (versaoAtual < 3) {
    await aplicarMigracaoV3(db);
  }
  if (versaoAtual < 4) {
    await aplicarMigracaoV4(db);
  }
  await salvarVersao(db, VERSAO_BANCO);
}

async function pegarVersao(db: SQLite.SQLiteDatabase) {
  const linha = await db.getFirstAsync<{ valor: string }>(
    `SELECT valor FROM meta WHERE chave = 'versao_banco' LIMIT 1;`
  );
  if (!linha?.valor) return 0;
  const n = Number(linha.valor);
  return Number.isFinite(n) ? n : 0;
}

async function salvarVersao(db: SQLite.SQLiteDatabase, versao: number) {
  await db.runAsync(
    `INSERT INTO meta (chave, valor) VALUES ('versao_banco', ?) 
     ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor;`,
    String(versao)
  );
}

async function aplicarMigracaoV1(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS turnos (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL,
      hora_inicio TEXT,
      hora_fim TEXT,
      localizacao TEXT NOT NULL,
      descricao_atividade_dia TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS responsaveis (
      id TEXT PRIMARY KEY NOT NULL,
      turno_id TEXT NOT NULL,
      nome TEXT NOT NULL,
      empresa TEXT NOT NULL,
      empresa_outra TEXT,
      FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS falhas_atividades (
      id TEXT PRIMARY KEY NOT NULL,
      turno_id TEXT NOT NULL,
      numero_falha TEXT,
      local TEXT NOT NULL,
      situacao TEXT NOT NULL,
      status TEXT NOT NULL,
      titulo_defeito TEXT NOT NULL,
      descricao_defeito TEXT NOT NULL,
      acoes_realizadas TEXT NOT NULL,
      proximo_turno_acompanhar INTEGER NOT NULL,
      nome_registrou TEXT NOT NULL,
      nome_editou TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS imagens_falha (
      id TEXT PRIMARY KEY NOT NULL,
      falha_id TEXT NOT NULL,
      uri TEXT NOT NULL,
      legenda TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (falha_id) REFERENCES falhas_atividades(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS historico_edicao (
      id TEXT PRIMARY KEY NOT NULL,
      entidade TEXT NOT NULL,
      entidade_id TEXT NOT NULL,
      quem_alterou TEXT NOT NULL,
      quando TEXT NOT NULL,
      campo_alterado TEXT NOT NULL,
      valor_anterior TEXT NOT NULL,
      novo_valor TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS modelos_texto (
      id TEXT PRIMARY KEY NOT NULL,
      titulo_modelo TEXT NOT NULL,
      titulo_defeito_padrao TEXT NOT NULL,
      descricao_padrao TEXT NOT NULL,
      acoes_comuns_padrao TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_responsaveis_turno ON responsaveis(turno_id);
    CREATE INDEX IF NOT EXISTS idx_falhas_turno ON falhas_atividades(turno_id);
    CREATE INDEX IF NOT EXISTS idx_falhas_situacao ON falhas_atividades(situacao);
    CREATE INDEX IF NOT EXISTS idx_falhas_status ON falhas_atividades(status);
    CREATE INDEX IF NOT EXISTS idx_falhas_local ON falhas_atividades(local);
    CREATE INDEX IF NOT EXISTS idx_falhas_registrou ON falhas_atividades(nome_registrou);
    CREATE INDEX IF NOT EXISTS idx_imagens_falha ON imagens_falha(falha_id);
    CREATE INDEX IF NOT EXISTS idx_hist_entidade ON historico_edicao(entidade, entidade_id);
  `);
}

async function aplicarMigracaoV2(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS configuracao_app (
      id TEXT PRIMARY KEY NOT NULL,
      nome_turno TEXT NOT NULL,
      hora_inicio_padrao TEXT,
      hora_fim_padrao TEXT,
      localizacao_padrao TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pessoas_padrao (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      empresa TEXT NOT NULL,
      empresa_outra TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_pessoas_padrao_nome ON pessoas_padrao(nome);
  `);
}

async function aplicarMigracaoV3(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS turnos_nova (
      id TEXT PRIMARY KEY NOT NULL,
      data TEXT NOT NULL,
      hora_inicio TEXT,
      hora_fim TEXT,
      localizacao TEXT NOT NULL,
      descricao_atividade_dia TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    INSERT INTO turnos_nova (
      id, data, hora_inicio, hora_fim, localizacao, descricao_atividade_dia, status, created_at, updated_at
    )
    SELECT
      id, data, hora_inicio, hora_fim, localizacao, descricao_atividade_dia, status, created_at, updated_at
    FROM turnos;

    DROP TABLE turnos;
    ALTER TABLE turnos_nova RENAME TO turnos;
  `);
}

async function aplicarMigracaoV4(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS falhas_atividades_nova (
      id TEXT PRIMARY KEY NOT NULL,
      turno_id TEXT NOT NULL,
      numero_falha TEXT,
      local TEXT NOT NULL,
      situacao TEXT NOT NULL,
      status TEXT NOT NULL,
      titulo_defeito TEXT NOT NULL,
      descricao_defeito TEXT NOT NULL,
      acoes_realizadas TEXT NOT NULL,
      proximo_turno_acompanhar INTEGER NOT NULL,
      nome_registrou TEXT NOT NULL,
      nome_editou TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (turno_id) REFERENCES turnos(id) ON DELETE CASCADE
    );

    INSERT INTO falhas_atividades_nova (
      id, turno_id, numero_falha, local, situacao, status,
      titulo_defeito, descricao_defeito, acoes_realizadas,
      proximo_turno_acompanhar, nome_registrou, nome_editou,
      created_at, updated_at
    )
    SELECT
      id, turno_id, numero_falha, local, situacao, status,
      titulo_defeito, descricao_defeito, acoes_realizadas,
      proximo_turno_acompanhar, nome_registrou, nome_editou,
      created_at, updated_at
    FROM falhas_atividades;

    DROP TABLE falhas_atividades;
    ALTER TABLE falhas_atividades_nova RENAME TO falhas_atividades;

    CREATE INDEX IF NOT EXISTS idx_falhas_turno ON falhas_atividades(turno_id);
    CREATE INDEX IF NOT EXISTS idx_falhas_situacao ON falhas_atividades(situacao);
    CREATE INDEX IF NOT EXISTS idx_falhas_status ON falhas_atividades(status);
    CREATE INDEX IF NOT EXISTS idx_falhas_local ON falhas_atividades(local);
    CREATE INDEX IF NOT EXISTS idx_falhas_registrou ON falhas_atividades(nome_registrou);
  `);
}

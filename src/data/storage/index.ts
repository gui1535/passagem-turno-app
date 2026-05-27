import * as FileSystem from 'expo-file-system/legacy';

// Arquivos locais (imagens, PDFs)
export const PASTA_IMAGENS = 'passagem-turno/imagens';
export const PASTA_PDFS = 'passagem-turno/pdfs';

function garantirBarraFinal(uri: string) {
  return uri.endsWith('/') ? uri : `${uri}/`;
}

function uriDocumentos() {
  const base = FileSystem.documentDirectory;
  if (!base) throw new Error('pasta de documentos indisponível');
  return garantirBarraFinal(base);
}

export function uriPastaImagens() {
  return `${uriDocumentos()}${PASTA_IMAGENS}/`;
}

export function uriPastaPdfs() {
  return `${uriDocumentos()}${PASTA_PDFS}/`;
}

export async function garantirPastas() {
  await FileSystem.makeDirectoryAsync(uriPastaImagens(), { intermediates: true });
  await FileSystem.makeDirectoryAsync(uriPastaPdfs(), { intermediates: true });
}

export async function copiarImagemParaApp(uriOrigem: string, nomeArquivo: string) {
  await garantirPastas();
  const destino = `${uriPastaImagens()}${nomeArquivo}`;
  await FileSystem.copyAsync({ from: uriOrigem, to: destino });
  return destino;
}

export async function apagarArquivo(uri: string) {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) return;
  await FileSystem.deleteAsync(uri, { idempotent: true });
}

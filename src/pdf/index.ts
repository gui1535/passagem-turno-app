import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

import type { Atividade, ImagemAtividade, Responsavel, Turno } from '@/src/domain/types';
import { uriPastaPdfs, garantirPastas } from '@/src/data/storage';

export type DadosRelatorio = {
  turno: Turno;
  responsaveis: Responsavel[];
  atividades: Atividade[];
  imagensPorAtividade: Record<string, ImagemAtividade[]>;
};

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function tituloAtividade(f: Atividade, indice: number) {
  const titulo = (f.tituloDefeito ?? '').trim();
  return titulo || `Atividade ${indice + 1}`;
}

async function uriParaDataUri(uri: string): Promise<string> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) return uri;

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const extensao = uri.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
    return `data:image/${extensao};base64,${base64}`;
  } catch {
    return uri;
  }
}

async function carregarLogoTriviaDataUri(): Promise<string> {
  try {
    const asset = Asset.fromModule(require('../../assets/images/logotipo-azul.png'));
    await asset.downloadAsync();
    const uri = asset.localUri ?? asset.uri;
    return await uriParaDataUri(uri);
  } catch {
    // fallback: não quebra o PDF se o asset falhar
    return '';
  }
}

async function carregarSrcImagens(imagensPorAtividade: Record<string, ImagemAtividade[]>) {
  const mapa: Record<string, string> = {};
  const todas = Object.values(imagensPorAtividade).flat();

  await Promise.all(
    todas.map(async (img) => {
      mapa[img.id] = await uriParaDataUri(img.uri);
    })
  );

  return mapa;
}

function montarImagensAtividade(imagens: ImagemAtividade[], srcPorId: Record<string, string>) {
  if (imagens.length === 0) {
    return '<p class="sem-fotos">Nenhuma foto registrada para desta atividade.</p>';
  }

  return imagens
    .map(
      (img, i) => `
        <div class="imagem-bloco">
          <div class="imagem-numero">Foto ${i + 1} de ${imagens.length}</div>
          <img src="${srcPorId[img.id] ?? img.uri}" alt="Foto" />
          <div class="legenda">${escapeHtml(img.legenda?.trim() || 'Sem descrição')}</div>
        </div>
      `
    )
    .join('');
}

function montarBlocoAtividade(
  f: Atividade,
  indice: number,
  numeroSecao: string,
  imagens: ImagemAtividade[],
  srcPorId: Record<string, string>
) {
  const titulo = tituloAtividade(f, indice);

  return `
    <section class="atividade-secao" id="atividade-${escapeHtml(f.id)}">
      <h3 class="atividade-titulo">${numeroSecao} ${escapeHtml(titulo)}</h3>

      <div class="atividade-descricao">
        <p><b>Situação:</b> <span class="${f.situacao === 'OK' ? 'ok' : 'nok'}">${escapeHtml(f.situacao)}</span></p>
        <p><b>Status:</b> ${escapeHtml(f.status)}</p>
        <p><b>Registrado por:</b> ${escapeHtml(f.nomeRegistrou)}</p>

        ${
          f.descricaoDefeito?.trim()
            ? `<p><b>Descrição:</b><br/>${escapeHtml(f.descricaoDefeito).replaceAll('\n', '<br/>')}</p>`
            : ''
        }

        ${
          f.acoesRealizadas?.trim()
            ? `<p><b>Ações realizadas:</b><br/>${escapeHtml(f.acoesRealizadas).replaceAll('\n', '<br/>')}</p>`
            : ''
        }
      </div>

      <h3 class="atividade-fotos-titulo">Fotos (${imagens.length})</h3>
      <div class="atividade-fotos">
        ${montarImagensAtividade(imagens, srcPorId)}
      </div>
    </section>
  `;
}

export async function montarHtmlRelatorio(dados: DadosRelatorio) {
  const { turno, responsaveis, atividades, imagensPorAtividade } = dados;
  const srcPorId = await carregarSrcImagens(imagensPorAtividade);
  const logoTriviaSrc = await carregarLogoTriviaDataUri();

  const responsaveisHtml = responsaveis
    .map(
      (r) => `
        <tr>
          <td>${escapeHtml(r.nome)}</td>
          <td>${escapeHtml(r.empresa)}${r.empresaOutra ? ` - ${escapeHtml(r.empresaOutra)}` : ''}</td>
        </tr>
      `
    )
    .join('');

  const atividadesTabelaHtml = atividades
    .map((f, i) => {
      const imagens = imagensPorAtividade[f.id] ?? [];
      return `
        <tr>
          <td>${escapeHtml(f.local !== '-' ? f.local : '—')}</td>
          <td class="${f.situacao === 'OK' ? 'ok' : 'nok'}">${escapeHtml(f.situacao)}</td>
          <td>${escapeHtml(f.tituloDefeito)}</td>
          <td>${imagens.length}</td>
        </tr>
      `;
    })
    .join('');

  const itensSumarioHtml = [
    '<p>1. Resumo</p>',
  ]
    .concat(
      atividades.length > 0
        ? [
            '<p>2. Atividades</p>',
            ...atividades.map(
              (f, i) =>
                `<p class="sumario-sub">2.${i + 1}. ${escapeHtml(tituloAtividade(f, i))}</p>`
            ),
          ]
        : []
    )
    .join('');

  const atividadesDetalheHtml = atividades
    .map((f, i) =>
      montarBlocoAtividade(f, i, `2.${i + 1}.`, imagensPorAtividade[f.id] ?? [], srcPorId)
    )
    .join('');

  const totalFotos = Object.values(imagensPorAtividade).reduce((s, lista) => s + lista.length, 0);

  const tipos = (turno.tiposManutencao ?? []).filter(Boolean);
  const tem = (v: string) => tipos.includes(v as any);
  const marcado = (v: string) => (tem(v) ? 'x' : ' ');

  const temHorario = !!(turno.horaInicio || turno.horaFim);
  const descricaoDia = (turno.descricaoAtividadeDoDia ?? '').trim();

  const responsaveisBlocoHtml =
    responsaveis.length > 0
      ? `
  <div class="responsaveis-title">RESPONSÁVEIS</div>

  <table>
    <tr>
      <th>Nome</th>
      <th>Empresa</th>
    </tr>
    ${responsaveisHtml}
  </table>
`
      : '';

  const sumarioBlocoHtml = `
  <div class="sumario">SUMÁRIO</div>
  ${
    atividades.length > 0
      ? `<p class="sumario-meta">${atividades.length} atividade(s)${totalFotos > 0 ? ` · ${totalFotos} foto(s)` : ''}</p>`
      : ''
  }
  <div class="sumario-lista">
    ${itensSumarioHtml}
  </div>
`;

  const resumoBlocoHtml = `
  <h2 id="secao-resumo">1. Resumo</h2>

  ${
    atividades.length > 0
      ? `
  <table class="atividades">
    <tr>
      <th>Local</th>
      <th>Situação</th>
      <th>Título</th>
      <th>Fotos</th>
    </tr>
    ${atividadesTabelaHtml}
  </table>
  `
      : '<p class="sem-fotos">Nenhuma atividade registrada.</p>'
  }
`;

  const atividadesSecaoHtml =
    atividades.length > 0
      ? `
  <h2 id="secao-atividades">2. Atividades</h2>
  ${atividadesDetalheHtml}
`
      : '';

  return `
<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />

<style>
  @page {
    size: A4;
    margin: 18mm 14mm;
  }

  body {
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #000;
    margin: 0;
  }

  .top-line {
    height: 4px;
    border-top: 3px solid #f26b21;
    border-bottom: 3px solid #1e9b50;
    margin-bottom: 18px;
  }

  .logo {
    text-align: right;
    margin-bottom: 6px;
  }

  .logo img {
    height: 42px;
    width: auto;
    display: inline-block;
  }

  h1 {
    text-align: center;
    font-size: 18px;
    margin: 0 0 8px;
  }

  h2 {
    font-size: 15px;
    margin-top: 28px;
    margin-bottom: 10px;
    color: #1E1D69;
    page-break-after: avoid;
  }

  h3.atividade-titulo {
    font-size: 14px;
    margin-top: 20px;
    margin-bottom: 10px;
    color: #1E1D69;
    page-break-after: avoid;
  }

  h3.atividade-fotos-titulo {
    font-size: 13px;
    margin: 14px 0 8px;
    padding-top: 8px;
    border-top: 1px dashed #999;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  td, th {
    border: 1px solid #000;
    padding: 6px;
    vertical-align: middle;
  }

  th {
    font-weight: bold;
    text-align: center;
  }

  .center {
    text-align: center;
  }

  .bold {
    font-weight: bold;
  }

  .tipo td {
    height: 32px;
    font-size: 14px;
  }

  .responsaveis-title {
    text-align: center;
    font-weight: bold;
    font-size: 16px;
    margin: 16px 0 0;
  }

  .sumario {
    margin-top: 20px;
    text-align: center;
    font-weight: bold;
    font-size: 16px;
  }

  .sumario-lista {
    margin-top: 16px;
    margin-left: 8px;
    line-height: 1.6;
  }

  .sumario-lista p {
    margin: 4px 0;
    font-weight: bold;
  }

  .sumario-lista p.sumario-sub {
    margin-left: 20px;
    font-weight: normal;
    font-size: 12px;
  }

  .sumario-meta {
    text-align: center;
    font-size: 11px;
    color: #444;
    margin-top: 6px;
  }

  .quadro-info {
    margin-top: 18px;
    background: #dfecc8;
    font-weight: bold;
  }

  .atividades th {
    background: #d9e6f5;
  }

  .atividades td {
    text-align: center;
    font-weight: bold;
  }

  .atividades td:nth-child(3) {
    font-weight: normal;
  }

  .ok {
    color: #00a651;
    font-weight: bold;
  }

  .nok {
    color: red;
    font-weight: bold;
  }

  .atividade-secao {
    margin-top: 24px;
    page-break-inside: avoid;
  }

  .atividade-descricao {
    margin: 8px 0 4px;
    line-height: 1.45;
  }

  .atividade-descricao p {
    margin: 6px 0;
  }

  .atividade-fotos {
    margin-top: 4px;
  }

  .imagem-bloco {
    page-break-inside: avoid;
    margin: 14px 0;
    text-align: center;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: #fafafa;
  }

  .imagem-numero {
    font-size: 11px;
    color: #555;
    margin-bottom: 6px;
  }

  .imagem-bloco img {
    max-width: 100%;
    max-height: 480px;
    object-fit: contain;
  }

  .legenda {
    font-weight: bold;
    font-size: 12px;
    margin-top: 6px;
  }

  .sem-fotos {
    font-style: italic;
    color: #555;
    margin: 8px 0;
  }
</style>
</head>

<body>
  <div class="top-line"></div>
  <div class="logo">
    ${logoTriviaSrc ? `<img src="${logoTriviaSrc}" alt="TRIVIA" />` : 'TRIVIA'}
  </div>

  <h1>RELATÓRIO DE ACOMPANHAMENTO CCO</h1>

  <table>
    <tr>
      <td class="bold">Data:</td>
      <td colspan="${temHorario ? 1 : 3}">${escapeHtml(turno.data)}</td>
      ${
        temHorario
          ? `
      <td class="bold">Horário:</td>
      <td>${escapeHtml(turno.horaInicio ?? '—')} – ${escapeHtml(turno.horaFim ?? '—')}</td>
      `
          : ''
      }
    </tr>
    <tr>
      <td colspan="4"><b>Localização:</b> ${escapeHtml(turno.localizacao)}</td>
    </tr>
    <tr>
    <td colspan="4"><b>Descrição do Turno:</b> ${escapeHtml(turno.descricaoAtividadeDoDia)}</td>
    </tr>
  </table>
  <br />

  <table class="tipo">
    <tr>
      <td>Corretiva ( ${marcado('Corretiva')} )</td>
      <td>Preventiva ( ${marcado('Preventiva')} )</td>
      <td>Estudos ( ${marcado('Estudos')} )</td>
      <td>Acompanhamento ( ${marcado('Acompanhamento')} )</td>
    </tr>
  </table>

  ${responsaveisBlocoHtml}

  ${sumarioBlocoHtml}

  ${resumoBlocoHtml}

  ${atividadesSecaoHtml}
</body>
</html>
`;
}

export async function gerarPdfRelatorio(html: string, nomeArquivo: string) {
  await garantirPastas();
  const destino = `${uriPastaPdfs()}${nomeArquivo}`;

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  await FileSystem.copyAsync({ from: uri, to: destino });
  return destino;
}

export async function compartilharPdf(uriPdf: string, assunto?: string, mensagem?: string) {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Compartilhamento indisponível neste dispositivo');
  }
  await Sharing.shareAsync(uriPdf, {
    mimeType: 'application/pdf',
    dialogTitle: assunto ?? 'Compartilhar PDF',
    UTI: 'com.adobe.pdf',
  });
  void mensagem;
}

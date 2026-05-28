import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

import type { FalhaAtividade, ImagemFalha, Responsavel, Turno } from '@/src/domain/types';
import { uriPastaPdfs, garantirPastas } from '@/src/data/storage';

export type DadosRelatorio = {
  turno: Turno;
  responsaveis: Responsavel[];
  falhas: FalhaAtividade[];
  imagensPorFalha: Record<string, ImagemFalha[]>;
};

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function rotuloFalha(f: FalhaAtividade, indice: number) {
  const numero = f.numeroFalha?.trim() || String(indice + 1);
  const local = f.local && f.local !== '-' ? f.local : '—';
  return `Falha ${numero} – ${local} – ${f.tituloDefeito}`;
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

async function carregarSrcImagens(imagensPorFalha: Record<string, ImagemFalha[]>) {
  const mapa: Record<string, string> = {};
  const todas = Object.values(imagensPorFalha).flat();

  await Promise.all(
    todas.map(async (img) => {
      mapa[img.id] = await uriParaDataUri(img.uri);
    })
  );

  return mapa;
}

function montarImagensFalha(imagens: ImagemFalha[], srcPorId: Record<string, string>) {
  if (imagens.length === 0) {
    return '<p class="sem-fotos">Nenhuma foto registrada para esta falha.</p>';
  }

  return imagens
    .map(
      (img, i) => `
        <div class="imagem-bloco">
          <div class="imagem-numero">Foto ${i + 1} de ${imagens.length}</div>
          <img src="${srcPorId[img.id] ?? img.uri}" alt="Foto da falha" />
          <div class="legenda">${escapeHtml(img.legenda?.trim() || 'Sem descrição')}</div>
        </div>
      `
    )
    .join('');
}

function montarBlocoFalha(
  f: FalhaAtividade,
  indice: number,
  numeroSecao: number,
  imagens: ImagemFalha[],
  srcPorId: Record<string, string>
) {
  const titulo = rotuloFalha(f, indice);

  return `
    <section class="falha-secao" id="falha-${escapeHtml(f.id)}">
      <h2>${numeroSecao}. ${escapeHtml(titulo)}</h2>

      <div class="falha-descricao">
        <p><b>Situação:</b> <span class="${f.situacao === 'OK' ? 'ok' : 'nok'}">${escapeHtml(f.situacao)}</span></p>
        <p><b>Status:</b> ${escapeHtml(f.status)}</p>
        <p><b>Registrado por:</b> ${escapeHtml(f.nomeRegistrou)}</p>

        ${
          f.descricaoDefeito?.trim()
            ? `<p><b>Descrição do defeito:</b><br/>${escapeHtml(f.descricaoDefeito).replaceAll('\n', '<br/>')}</p>`
            : ''
        }

        ${
          f.acoesRealizadas?.trim()
            ? `<p><b>Ações realizadas:</b><br/>${escapeHtml(f.acoesRealizadas).replaceAll('\n', '<br/>')}</p>`
            : ''
        }
      </div>

      <h3 class="falha-fotos-titulo">Fotos desta falha (${imagens.length})</h3>
      <div class="falha-fotos">
        ${montarImagensFalha(imagens, srcPorId)}
      </div>
    </section>
  `;
}

export async function montarHtmlRelatorio(dados: DadosRelatorio) {
  const { turno, responsaveis, falhas, imagensPorFalha } = dados;
  const srcPorId = await carregarSrcImagens(imagensPorFalha);
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

  const falhasTabelaHtml = falhas
    .map((f, i) => {
      const imagens = imagensPorFalha[f.id] ?? [];
      return `
        <tr>
          <td>${i + 2}</td>
          <td>${escapeHtml(f.numeroFalha || '—')}</td>
          <td>${escapeHtml(f.local !== '-' ? f.local : '—')}</td>
          <td class="${f.situacao === 'OK' ? 'ok' : 'nok'}">${escapeHtml(f.situacao)}</td>
          <td>${escapeHtml(f.tituloDefeito)}</td>
          <td>${imagens.length}</td>
        </tr>
      `;
    })
    .join('');

  const itensSumarioHtml = [
    '<p>1. Descrição da atividade</p>',
    ...falhas.map((f, i) => `<p>${i + 2}. ${escapeHtml(rotuloFalha(f, i))}</p>`),
  ].join('');

  const falhasDetalheHtml = falhas
    .map((f, i) => montarBlocoFalha(f, i, i + 2, imagensPorFalha[f.id] ?? [], srcPorId))
    .join('');

  const totalFotos = Object.values(imagensPorFalha).reduce((s, lista) => s + lista.length, 0);

  const tipos = (turno.tiposManutencao ?? []).filter(Boolean);
  const tem = (v: string) => tipos.includes(v as any);
  const marcado = (v: string) => (tem(v) ? 'x' : ' ');
  const tituloTipo =
    tipos.length > 0 ? `Tipos: ${tipos.join(', ')}` : 'Tipos: Acompanhamento';

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

  h3.falha-fotos-titulo {
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

  .falhas th {
    background: #d9e6f5;
  }

  .falhas td {
    text-align: center;
    font-weight: bold;
  }

  .falhas td:nth-child(5) {
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

  .falha-secao {
    margin-top: 24px;
    page-break-inside: avoid;
  }

  .falha-descricao {
    margin: 8px 0 4px;
    line-height: 1.45;
  }

  .falha-descricao p {
    margin: 6px 0;
  }

  .falha-fotos {
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
      <td>${escapeHtml(turno.data)}</td>
      <td class="bold">Horário:</td>
      <td>${escapeHtml(turno.horaInicio ?? '—')} às ${escapeHtml(turno.horaFim ?? '—')}</td>
    </tr>
    <tr>
      <td colspan="4"><b>Localização:</b> ${escapeHtml(turno.localizacao)}</td>
    </tr>
    <tr>
      <td colspan="4"><b>Descrição da atividade:</b> ${escapeHtml(turno.descricaoAtividadeDoDia || '—')}</td>
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

  <div class="responsaveis-title">RESPONSÁVEIS</div>

  <table>
    <tr>
      <th>Nome</th>
      <th>Empresa</th>
    </tr>
    ${responsaveisHtml || '<tr><td colspan="2" class="center">Nenhum responsável cadastrado</td></tr>'}
  </table>

  <div class="sumario">SUMÁRIO</div>
  <p class="sumario-meta">${falhas.length} falha(s) · ${totalFotos} foto(s) no total</p>
  <div class="sumario-lista">
    ${itensSumarioHtml}
  </div>

  <h2 id="secao-descricao">1. Descrição da atividade</h2>

  <p><b>${escapeHtml(tituloTipo)}</b></p>

  <table class="quadro-info">
    <tr>
      <td>
        Data ${escapeHtml(turno.data)}<br/>
        Equipe: CCO / CPTM
      </td>
    </tr>
  </table>

  <p><b>Resumo das falhas</b> (detalhamento e fotos em cada seção abaixo)</p>

  <table class="falhas">
    <tr>
      <th>Seção</th>
      <th>Falha</th>
      <th>Local</th>
      <th>Situação</th>
      <th>Descrição do defeito</th>
      <th>Fotos</th>
    </tr>
    ${falhasTabelaHtml || '<tr><td colspan="6" class="center">Nenhuma falha registrada</td></tr>'}
  </table>

  ${falhasDetalheHtml || '<p class="center">Nenhuma falha registrada para detalhar.</p>'}
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

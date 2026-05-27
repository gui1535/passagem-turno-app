import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

import type { FalhaAtividade, ImagemFalha, Responsavel, Turno } from '@/src/domain/types';
import { uriPastaPdfs, garantirPastas } from '@/src/data/storage';

// PDF (geração simples)
export type DadosRelatorio = {
  turno: Turno;
  responsaveis: Responsavel[];
  falhas: FalhaAtividade[];
  imagensPorFalha: Record<string, ImagemFalha[]>;
};

export function montarHtmlRelatorio(dados: DadosRelatorio) {
  const { turno, responsaveis, falhas } = dados;

  const responsaveisHtml = responsaveis
    .map((r) => `<li>${escapeHtml(r.nome)} — ${escapeHtml(r.empresa)}${r.empresaOutra ? ` (${escapeHtml(r.empresaOutra)})` : ''}</li>`)
    .join('');

  const falhasHtml = falhas
    .map((f) => {
      return `
        <div class="bloco">
          <div class="linha"><b>Nº:</b> ${escapeHtml(f.numeroFalha ?? '-')}</div>
          <div class="linha"><b>Local:</b> ${escapeHtml(f.local)}</div>
          <div class="linha"><b>Situação:</b> ${escapeHtml(f.situacao)}</div>
          <div class="linha"><b>Status:</b> ${escapeHtml(f.status)}</div>
          <div class="linha"><b>Título:</b> ${escapeHtml(f.tituloDefeito)}</div>
          <div class="linha"><b>Descrição:</b><br/>${escapeHtml(f.descricaoDefeito).replaceAll('\n', '<br/>')}</div>
          <div class="linha"><b>Ações:</b><br/>${escapeHtml(f.acoesRealizadas).replaceAll('\n', '<br/>')}</div>
          <div class="linha"><b>Próximo turno acompanha?</b> ${f.proximoTurnoAcompanhar ? 'Sim' : 'Não'}</div>
        </div>
      `;
    })
    .join('');

  return `
  <!doctype html>
  <html lang="pt-br">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111; }
        .titulo { font-size: 18px; margin-bottom: 8px; }
        .sub { margin: 2px 0; }
        .secao { margin-top: 16px; }
        .bloco { border: 1px solid #ddd; border-radius: 8px; padding: 10px; margin: 10px 0; }
        .linha { margin: 3px 0; }
        ul { margin: 6px 0 0 18px; }
      </style>
      <title>Passagem de Turno</title>
    </head>
    <body>
      <div class="titulo">Passagem de Turno</div>
      <div class="sub"><b>Data:</b> ${escapeHtml(turno.data)}</div>
      <div class="sub"><b>Início:</b> ${escapeHtml(turno.horaInicio ?? '-')} <b>Fim:</b> ${escapeHtml(turno.horaFim ?? '-')}</div>
      <div class="sub"><b>Localização:</b> ${escapeHtml(turno.localizacao)}</div>
      <div class="sub"><b>Descrição do dia:</b><br/>${escapeHtml(turno.descricaoAtividadeDoDia).replaceAll('\n', '<br/>')}</div>

      <div class="secao"><b>Responsáveis</b></div>
      <ul>${responsaveisHtml || '<li>-</li>'}</ul>

      <div class="secao"><b>Falhas/Atividades</b></div>
      ${falhasHtml || '<div class="bloco">Nenhuma falha/atividade registrada.</div>'}
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
  // Observação: assunto/mensagem de e-mail dependem do app escolhido; o share sheet nem sempre respeita.
  void mensagem;
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

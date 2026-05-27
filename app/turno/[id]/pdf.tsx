import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Tela } from '@/components/tela';
import { TopoVoltar } from '@/components/topo-voltar';
import { ThemedText } from '@/components/themed-text';
import type { FalhaAtividade, ImagemFalha, Responsavel, Turno } from '@/src/domain/types';
import {
  listarFalhas,
  listarImagensDaFalha,
  listarResponsaveis,
  pegarTurnoPorId,
} from '@/src/data/repositories';
import { compartilharPdf, gerarPdfRelatorio, montarHtmlRelatorio } from '@/src/pdf';

export default function PdfScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const turnoId = String(id);

  const [turno, setTurno] = useState<Turno | null>(null);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [falhas, setFalhas] = useState<FalhaAtividade[]>([]);
  const [imagensPorFalha, setImagensPorFalha] = useState<Record<string, ImagemFalha[]>>({});
  const [uriPdf, setUriPdf] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const assunto = useMemo(() => {
    const data = turno?.data ?? '';
    return `Passagem de Turno - CCO - ${data}`;
  }, [turno?.data]);

  useEffect(() => {
    void (async () => {
      const t = await pegarTurnoPorId(turnoId);
      const r = await listarResponsaveis(turnoId);
      const f = await listarFalhas(turnoId);
      const imagens: Record<string, ImagemFalha[]> = {};
      for (const item of f) {
        imagens[item.id] = await listarImagensDaFalha(item.id);
      }
      setTurno(t);
      setResponsaveis(r);
      setFalhas(f);
      setImagensPorFalha(imagens);
    })();
  }, [turnoId]);

  async function gerar() {
    if (!turno) return;
    setCarregando(true);
    try {
      const html = montarHtmlRelatorio({ turno, responsaveis, falhas, imagensPorFalha });
      const nome = `PassagemTurno_${turno.data.replaceAll('/', '-')}.pdf`;
      const uri = await gerarPdfRelatorio(html, nome);
      setUriPdf(uri);
    } finally {
      setCarregando(false);
    }
  }

  async function compartilhar() {
    if (!uriPdf) return;
    await compartilharPdf(uriPdf, assunto, '');
  }

  return (
    <Tela style={styles.container}>
      <TopoVoltar titulo="PDF" />

      <View style={[styles.card, styles.secao, { marginTop: 20 }]}>
        <ThemedText>
          <ThemedText type="defaultSemiBold">Turno:</ThemedText> {turno?.data ?? '-'}
        </ThemedText>
        <ThemedText>
          <ThemedText type="defaultSemiBold">Responsáveis:</ThemedText> {responsaveis.length}
        </ThemedText>
        <ThemedText>
          <ThemedText type="defaultSemiBold">Falhas/atividades:</ThemedText> {falhas.length}
        </ThemedText>
      </View>

      <View style={styles.secao}>
        <Pressable style={styles.botao} onPress={gerar} disabled={carregando}>
          <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
            {carregando ? 'Gerando...' : 'Gerar PDF'}
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.secao}>
        <Pressable style={[styles.botao, !uriPdf && styles.botaoDesativado]} onPress={compartilhar} disabled={!uriPdf}>
          <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
            Compartilhar
          </ThemedText>
        </Pressable>
      </View>

      {uriPdf ? <ThemedText style={styles.mini}>Arquivo: {uriPdf}</ThemedText> : null}
    </Tela>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  secao: {
    marginBottom: 20,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  botao: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoDesativado: {
    opacity: 0.5,
  },
  botaoTexto: { color: '#fff' },
  mini: { opacity: 0.75 },
});

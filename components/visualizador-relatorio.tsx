import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { WebView } from 'react-native-webview';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { corBotao } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { DadosRelatorio } from '@/src/pdf';
import { compartilharPdf, gerarPdfRelatorio, montarHtmlRelatorio } from '@/src/pdf';

type Props = {
  visivel: boolean;
  dados: DadosRelatorio | null;
  onFechar: () => void;
};

export function VisualizadorRelatorio({ visivel, dados, onFechar }: Props) {
  const insets = useSafeAreaInsets();
  const fundo = useThemeColor({}, 'background');
  const corTexto = useThemeColor({}, 'text');
  const corIcone = useThemeColor({}, 'text');

  const [carregandoPreview, setCarregandoPreview] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [html, setHtml] = useState('');

  const assunto = useMemo(() => {
    const data = dados?.turno.data ?? '';
    return `Passagem de Turno - CCO - ${data}`;
  }, [dados?.turno.data]);

  useEffect(() => {
    if (!dados || !visivel) {
      setHtml('');
      return;
    }

    setCarregandoPreview(true);
    let ativo = true;

    void (async () => {
      try {
        const gerado = await montarHtmlRelatorio(dados);
        if (ativo) setHtml(gerado);
      } finally {
        if (ativo) setCarregandoPreview(false);
      }
    })();

    return () => {
      ativo = false;
    };
  }, [dados, visivel]);

  async function exportarECompartilhar() {
    if (!dados || exportando) return;
    setExportando(true);
    try {
      const nome = `PassagemTurno_${dados.turno.data.replaceAll('/', '-')}.pdf`;
      const htmlPdf = html || (await montarHtmlRelatorio(dados));
      const uri = await gerarPdfRelatorio(htmlPdf, nome);
      await compartilharPdf(uri, assunto, '');
      Toast.show({
        type: 'success',
        text1: 'PDF pronto',
        text2: 'Escolha como enviar no menu do sistema',
        position: 'top',
        visibilityTime: 2500,
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível exportar',
        text2: 'Tente novamente em instantes',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setExportando(false);
    }
  }

  function fechar() {
    setExportando(false);
    setCarregandoPreview(false);
    onFechar();
  }

  return (
    <Modal visible={visivel} animationType="slide" presentationStyle="fullScreen" onRequestClose={fechar}>
      <View style={[styles.container, { backgroundColor: fundo, paddingTop: insets.top }]}>
        <View style={styles.topo}>
          <Pressable
            style={styles.botaoVoltar}
            onPress={fechar}
            disabled={exportando}
            accessibilityLabel="Voltar">
            <IconSymbol name="chevron.left" size={22} color={corIcone} />
          </Pressable>
          <View style={styles.topoTextos}>
            <ThemedText type="defaultSemiBold" style={styles.titulo}>
              Pré-visualização
            </ThemedText>
          </View>
        </View>

        <View style={styles.previewArea}>
          {carregandoPreview ? (
            <View style={styles.carregandoWrap}>
              <ActivityIndicator size="large" color={corBotao} />
              <ThemedText style={styles.carregandoTexto}>Montando relatório...</ThemedText>
            </View>
          ) : null}

          {dados && html && !carregandoPreview ? (
            <WebView
              style={styles.webview}
              originWhitelist={['*']}
              source={{ html }}
              showsVerticalScrollIndicator
            />
          ) : null}
        </View>

        <View style={[styles.rodape, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable
            style={[styles.botaoPrimario, exportando && styles.botaoDesativado]}
            onPress={() => void exportarECompartilhar()}
            disabled={!dados || exportando || carregandoPreview}>
            {exportando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="defaultSemiBold" style={styles.botaoPrimarioTexto}>
                Exportar e compartilhar
              </ThemedText>
            )}
          </Pressable>

          <Pressable
            style={styles.botaoSecundario}
            onPress={fechar}
            disabled={exportando}>
            <ThemedText type="defaultSemiBold" style={{ color: corTexto }}>
              Voltar
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#687076',
  },
  botaoVoltar: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
  },
  topoTextos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    fontSize: 18,
  },
  resumo: {
    fontSize: 13,
    opacity: 0.75,
  },
  aviso: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(30, 29, 105, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(30, 29, 105, 0.2)',
  },
  avisoTexto: {
    fontSize: 14,
    lineHeight: 20,
  },
  previewArea: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    backgroundColor: '#f4f5f7',
  },
  carregandoWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  carregandoTexto: {
    opacity: 0.7,
    fontSize: 14,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  rodape: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#687076',
  },
  botaoPrimario: {
    backgroundColor: corBotao,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  botaoPrimarioTexto: {
    color: '#fff',
  },
  botaoSecundario: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
  },
  botaoDesativado: {
    opacity: 0.65,
  },
});

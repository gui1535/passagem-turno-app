import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/themed-text';
import { VisualizadorImagem } from '@/components/visualizador-imagem';
import { useThemeColor } from '@/hooks/use-theme-color';
import { atualizarLegendaImagem, listarImagensDaAtividade, removerImagem } from '@/src/data/repositories';
import { apagarArquivo } from '@/src/data/storage';
import type { ImagemAtividade } from '@/src/domain/types';
import {
  capturarFotoParaAtividade,
  enviarImagensParaAtividade,
  type ResultadoImagemAtividade,
  type ResultadoUploadImagens,
} from '@/src/features/imagens/adicionarImagemAtividade';

type Props = {
  atividadeId: string;
  /** Quando dentro de um card pai, oculta título e margem externa */
  semCabecalho?: boolean;
};

const MAX_LEGENDA_THUMB = 15;

function formatarLegendaThumb(legenda?: string): string | null {
  const texto = legenda?.trim();
  if (!texto) return null;
  if (texto.length <= MAX_LEGENDA_THUMB) return texto;
  return `${texto.slice(0, MAX_LEGENDA_THUMB - 3)}...`;
}

function tratarResultado(resultado: ResultadoImagemAtividade, sucesso: string) {
  if (resultado === 'ok') {
    Toast.show({ type: 'success', text1: sucesso, position: 'top', visibilityTime: 2000 });
    return true;
  }
  if (resultado === 'sem_permissao') {
    Toast.show({
      type: 'error',
      text1: 'Permissão negada',
      text2: 'Ative nas configurações do aparelho',
      position: 'top',
      visibilityTime: 3000,
    });
  }
  return false;
}

function tratarUpload(resultado: ResultadoUploadImagens) {
  if (resultado.status === 'ok') {
    const msg =
      resultado.quantidade === 1
        ? '1 imagem enviada'
        : `${resultado.quantidade} imagens enviadas`;
    Toast.show({ type: 'success', text1: msg, position: 'top', visibilityTime: 2000 });
    return true;
  }
  if (resultado.status === 'sem_permissao') {
    Toast.show({
      type: 'error',
      text1: 'Permissão negada',
      text2: 'Ative nas configurações do aparelho',
      position: 'top',
      visibilityTime: 3000,
    });
  }
  return false;
}

export function FotosAtividade({ atividadeId, semCabecalho }: Props) {
  const corIconeAcao = useThemeColor({}, 'tint');
  const [imagens, setImagens] = useState<ImagemAtividade[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [imagemVisualizando, setImagemVisualizando] = useState<ImagemAtividade | null>(null);

  const carregar = useCallback(() => {
    void (async () => {
      setImagens(await listarImagensDaAtividade(atividadeId));
    })();
  }, [atividadeId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function confirmarExclusao(img: ImagemAtividade) {
    Alert.alert('Remover foto', 'Tem certeza que deseja remover esta foto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await removerImagem(img.id);
            await apagarArquivo(img.uri);
            if (imagemVisualizando?.id === img.id) setImagemVisualizando(null);
            carregar();
          })();
        },
      },
    ]);
  }

  async function fazerUpload() {
    if (enviando) return;
    setEnviando(true);
    try {
      const ok = tratarUpload(await enviarImagensParaAtividade(atividadeId));
      if (ok) carregar();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={semCabecalho ? undefined : styles.secao}>
      {!semCabecalho ? (
        <ThemedText type="defaultSemiBold" style={styles.titulo}>
          Fotos ({imagens.length})
        </ThemedText>
      ) : null}

      {imagens.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.galeria}
          contentContainerStyle={styles.galeriaConteudo}>
          {imagens.map((img) => {
            const legendaThumb = formatarLegendaThumb(img.legenda);
            return (
              <View key={img.id} style={styles.thumbWrap}>
                <View style={styles.thumbImagemWrap}>
                  <Pressable
                    onPress={() => setImagemVisualizando(img)}
                    accessibilityLabel="Visualizar imagem">
                    <Image source={{ uri: img.uri }} style={styles.thumb} contentFit="cover" />
                  </Pressable>
                  <Pressable style={styles.thumbExcluir} onPress={() => confirmarExclusao(img)}>
                    <ThemedText style={styles.thumbExcluirTexto}>×</ThemedText>
                  </Pressable>
                </View>
                {legendaThumb ? (
                  <ThemedText style={styles.thumbLegenda} numberOfLines={1}>
                    {legendaThumb}
                  </ThemedText>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <ThemedText style={styles.vazio}>Nenhuma foto ainda.</ThemedText>
      )}

      <Pressable
        style={styles.botaoUpload}
        onPress={() => void fazerUpload()}
        disabled={enviando}>
        {enviando ? (
          <ActivityIndicator size="small" color={corIconeAcao} />
        ) : (
          <ThemedText type="defaultSemiBold" style={{ color: corIconeAcao }}>
            Fazer upload de fotos
          </ThemedText>
        )}
      </Pressable>

      <VisualizadorImagem
        imagem={
          imagemVisualizando
            ? { uri: imagemVisualizando.uri, legenda: imagemVisualizando.legenda }
            : null
        }
        onFechar={(legenda) => {
          void (async () => {
            if (imagemVisualizando) {
              const atual = imagemVisualizando.legenda ?? '';
              if (legenda !== atual) {
                await atualizarLegendaImagem(imagemVisualizando.id, legenda || undefined);
                carregar();
              }
            }
            setImagemVisualizando(null);
          })();
        }}
      />
    </View>
  );
}

export async function tirarFotoDaAtividade(atividadeId: string): Promise<boolean> {
  return tratarResultado(await capturarFotoParaAtividade(atividadeId), 'Foto adicionada');
}

const styles = StyleSheet.create({
  secao: {
    marginBottom: 20,
  },
  titulo: {
    marginBottom: 12,
  },
  vazio: {
    opacity: 0.75,
    marginBottom: 12,
  },
  galeria: {
    marginBottom: 12,
  },
  galeriaConteudo: {
    gap: 10,
  },
  thumbWrap: {
    width: 88,
    alignItems: 'center',
  },
  thumbImagemWrap: {
    position: 'relative',
  },
  thumbLegenda: {
    marginTop: 4,
    width: 88,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    opacity: 0.85,
  },
  thumb: {
    width: 88,
    height: 88,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
  },
  thumbExcluir: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbExcluirTexto: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '700',
  },
  botaoUpload: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});

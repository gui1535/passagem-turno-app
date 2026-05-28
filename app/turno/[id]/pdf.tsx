import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Tela } from '@/components/tela';
import { ThemedText } from '@/components/themed-text';
import { TopoVoltar } from '@/components/topo-voltar';
import { VisualizadorRelatorio } from '@/components/visualizador-relatorio';
import { corBotao } from '@/constants/theme';
import {
  listarFalhas,
  listarImagensDaFalha,
  listarResponsaveis,
  pegarTurnoPorId,
} from '@/src/data/repositories';
import type { FalhaAtividade, ImagemFalha, Responsavel, Turno } from '@/src/domain/types';

export default function PdfScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const turnoId = String(id);

  const [carregando, setCarregando] = useState(true);
  const [turno, setTurno] = useState<Turno | null>(null);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [falhas, setFalhas] = useState<FalhaAtividade[]>([]);
  const [imagensPorFalha, setImagensPorFalha] = useState<Record<string, ImagemFalha[]>>({});

  const carregar = useCallback(() => {
    void (async () => {
      setCarregando(true);
      try {
        const [t, r, f] = await Promise.all([
          pegarTurnoPorId(turnoId),
          listarResponsaveis(turnoId),
          listarFalhas(turnoId),
        ]);

        const imagens: Record<string, ImagemFalha[]> = {};
        for (const item of f) {
          imagens[item.id] = await listarImagensDaFalha(item.id);
        }

        setTurno(t);
        setResponsaveis(r);
        setFalhas(f);
        setImagensPorFalha(imagens);
      } finally {
        setCarregando(false);
      }
    })();
  }, [turnoId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const dadosRelatorio = turno && !carregando ? { turno, responsaveis, falhas, imagensPorFalha } : null;

  return (
    <Tela style={styles.container}>
      <TopoVoltar titulo="Pré-visualização do PDF" />

      {carregando ? (
        <View style={styles.estado}>
          <ActivityIndicator size="large" color={corBotao} />
          <ThemedText style={styles.textoEstado}>Carregando dados do turno...</ThemedText>
        </View>
      ) : !turno ? (
        <View style={styles.estado}>
          <ThemedText style={styles.textoEstado}>Turno não encontrado.</ThemedText>
        </View>
      ) : null}

      <VisualizadorRelatorio
        visivel={!!turno}
        dados={dadosRelatorio}
        onFechar={() => router.back()}
      />
    </Tela>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  estado: {
    marginTop: 24,
    alignItems: 'center',
    gap: 12,
  },
  textoEstado: {
    opacity: 0.75,
    textAlign: 'center',
  },
});


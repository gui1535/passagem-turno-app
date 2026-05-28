import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Tela } from '@/components/tela';
import { ThemedText } from '@/components/themed-text';
import { TopoVoltar } from '@/components/topo-voltar';
import { VisualizadorRelatorio } from '@/components/visualizador-relatorio';
import { corBotao } from '@/constants/theme';
import {
  listarAtividades,
  listarImagensDaAtividade,
  listarResponsaveis,
  pegarTurnoPorId,
} from '@/src/data/repositories';
import type { Atividade, ImagemAtividade, Responsavel, Turno } from '@/src/domain/types';

export default function PdfScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const turnoId = String(id);

  const [carregando, setCarregando] = useState(true);
  const [turno, setTurno] = useState<Turno | null>(null);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [imagensPorAtividade, setImagensPorAtividade] = useState<Record<string, ImagemAtividade[]>>({});

  const carregar = useCallback(() => {
    void (async () => {
      setCarregando(true);
      try {
        const [t, r, f] = await Promise.all([
          pegarTurnoPorId(turnoId),
          listarResponsaveis(turnoId),
          listarAtividades(turnoId),
        ]);

        const imagens: Record<string, ImagemAtividade[]> = {};
        for (const item of f) {
          imagens[item.id] = await listarImagensDaAtividade(item.id);
        }

        setTurno(t);
        setResponsaveis(r);
        setAtividades(f);
        setImagensPorAtividade(imagens);
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

  const dadosRelatorio = turno && !carregando ? { turno, responsaveis, atividades, imagensPorAtividade } : null;

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


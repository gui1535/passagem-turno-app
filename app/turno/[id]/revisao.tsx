import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Tela } from '@/components/tela';
import { TopoVoltar } from '@/components/topo-voltar';
import { ThemedText } from '@/components/themed-text';
import type { FalhaAtividade, Responsavel, Turno } from '@/src/domain/types';
import { listarFalhas, listarResponsaveis, pegarTurnoPorId } from '@/src/data/repositories';

export default function RevisaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const turnoId = String(id);

  const [turno, setTurno] = useState<Turno | null>(null);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [falhas, setFalhas] = useState<FalhaAtividade[]>([]);

  useEffect(() => {
    void (async () => {
      const t = await pegarTurnoPorId(turnoId);
      const r = await listarResponsaveis(turnoId);
      const f = await listarFalhas(turnoId);
      setTurno(t);
      setResponsaveis(r);
      setFalhas(f);
    })();
  }, [turnoId]);

  return (
    <Tela style={styles.container}>
      <TopoVoltar titulo="Revisão" />

      <View style={[styles.card, styles.secao]}>
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

      <ThemedText style={styles.mini}>
        Aqui vai ficar a revisão completa antes de gerar o PDF.
      </ThemedText>
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
  mini: { opacity: 0.75 },
});

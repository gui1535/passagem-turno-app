import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Tela } from '@/components/tela';
import { ThemedText } from '@/components/themed-text';
import type { Turno } from '@/src/domain/types';
import { pegarTurnoPorId } from '@/src/data/repositories';

export default function TurnoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [turno, setTurno] = useState<Turno | null>(null);

  useEffect(() => {
    void (async () => {
      if (!id) return;
      const t = await pegarTurnoPorId(String(id));
      setTurno(t);
    })();
  }, [id]);

  return (
    <Tela style={styles.container}>
      <ThemedText type="title">Turno</ThemedText>
      {turno ? (
        <View style={styles.card}>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Data:</ThemedText> {turno.data}
          </ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Local:</ThemedText> {turno.localizacao}
          </ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Tipo:</ThemedText> {turno.tipoAtividade}
          </ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Status:</ThemedText> {turno.status}
          </ThemedText>
        </View>
      ) : (
        <ThemedText>Carregando...</ThemedText>
      )}

      <View style={styles.grade}>
        <Atalho href={`/turno/${id}/responsaveis`} titulo="Responsáveis" />
        <Atalho href={`/turno/${id}/falhas`} titulo="Falhas/atividades" />
        <Atalho href={`/turno/${id}/revisao`} titulo="Revisão" />
        <Atalho href={`/turno/${id}/pdf`} titulo="PDF" />
      </View>
    </Tela>
  );
}

function Atalho(props: { href: string; titulo: string }) {
  return (
    <Pressable style={styles.atalho} onPress={() => router.push(props.href as any)}>
      <ThemedText type="defaultSemiBold">{props.titulo}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  atalho: {
    width: '48%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
  },
});


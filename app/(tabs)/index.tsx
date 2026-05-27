import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Tela } from '@/components/tela';
import { ThemedText } from '@/components/themed-text';
import type { Turno } from '@/src/domain/types';
import { listarTurnos } from '@/src/data/repositories';

export default function TurnosScreen() {
  const [turnos, setTurnos] = useState<Turno[]>([]);

  const carregar = useCallback(() => {
    void (async () => {
      const lista = await listarTurnos();
      setTurnos(lista);
    })();
  }, []);

  useFocusEffect(carregar);

  return (
    <Tela style={styles.container}>
      <View style={styles.topo}>
        <ThemedText type="title">Turnos</ThemedText>
        <Pressable style={styles.botaoNovo} onPress={() => router.push('/turno/novo')}>
          <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
            Novo
          </ThemedText>
        </Pressable>
      </View>

      {turnos.length === 0 ? (
        <ThemedText>Nenhum turno ainda.</ThemedText>
      ) : (
        <View style={styles.lista}>
          {turnos.map((t) => (
            <Pressable
              key={t.id}
              style={styles.item}
              onPress={() => router.push(`/turno/${t.id}` as any)}>
              <ThemedText type="defaultSemiBold">{t.data}</ThemedText>
              <ThemedText>{t.localizacao}</ThemedText>
              <ThemedText style={styles.mini}>{t.status}</ThemedText>
            </Pressable>
          ))}
        </View>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botaoNovo: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  botaoTexto: {
    color: '#fff',
  },
  lista: {
    gap: 10,
  },
  item: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  mini: {
    opacity: 0.75,
  },
});

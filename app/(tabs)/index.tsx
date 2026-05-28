import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { CabecalhoLogo } from '@/components/cabecalho-logo';
import { Tela } from '@/components/tela';
import { ThemedText } from '@/components/themed-text';
import { corBotao } from '@/constants/theme';
import { listarTurnos, removerTurno } from '@/src/data/repositories';
import type { Turno } from '@/src/domain/types';

export default function TurnosScreen() {
  const [turnos, setTurnos] = useState<Turno[]>([]);

  const carregar = useCallback(() => {
    void (async () => {
      const lista = await listarTurnos();
      setTurnos(lista);
    })();
  }, []);

  useFocusEffect(carregar);

  function confirmarExclusao(turno: Turno) {
    Alert.alert(
      'Excluir turno',
      `Tem certeza que deseja excluir o turno de ${turno.data} (${turno.localizacao})? Todas as atividades e fotos serão removidas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await removerTurno(turno.id);
              carregar();
            })();
          },
        },
      ]
    );
  }

  return (
    <Tela style={styles.container}>
      <CabecalhoLogo
        alturaLogo={36}
        alinhamentoLogo="left"
        acaoDireita={
          <Pressable style={styles.botaoNovo} onPress={() => router.push('/turno/novo')}>
            <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
              Novo
            </ThemedText>
          </Pressable>
        }
      />

      {turnos.length === 0 ? (
        <ThemedText style={styles.vazio}>Nenhum turno ainda.</ThemedText>
      ) : (
        <View style={styles.lista}>
          {turnos.map((t) => (
            <View key={t.id} style={styles.item}>
              <Pressable
                style={styles.itemConteudo}
                onPress={() => router.push(`/turno/${t.id}` as any)}>
                <ThemedText type="defaultSemiBold">{t.data}</ThemedText>
                <ThemedText>{t.localizacao}</ThemedText>
              </Pressable>
              <View style={styles.acoes}>
                <Pressable style={styles.botaoExcluir} onPress={() => confirmarExclusao(t)}>
                  <ThemedText style={styles.excluirTexto}>Excluir</ThemedText>
                </Pressable>
              </View>
            </View>
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
  },
  botaoNovo: {
    backgroundColor: corBotao,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  botaoTexto: {
    color: '#fff',
  },
  vazio: {
    opacity: 0.75,
  },
  lista: {
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
  },
  itemConteudo: {
    flex: 1,
    gap: 4,
  },
  acoes: {
    gap: 8,
    alignItems: 'center',
  },
  botaoExcluir: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
  },
  excluirTexto: {
    fontSize: 13,
    opacity: 0.85,
  },
});

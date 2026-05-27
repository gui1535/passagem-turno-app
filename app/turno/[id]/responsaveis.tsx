import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Tela } from '@/components/tela';
import { ThemedText } from '@/components/themed-text';
import { Empresa } from '@/src/domain/enums';
import type { Responsavel } from '@/src/domain/types';
import {
  criarResponsavel,
  listarResponsaveis,
  removerResponsavel,
} from '@/src/data/repositories';

export default function ResponsaveisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const turnoId = String(id);

  const [nome, setNome] = useState('');
  const [empresaOutra, setEmpresaOutra] = useState('');
  const [lista, setLista] = useState<Responsavel[]>([]);

  const carregar = useCallback(() => {
    void (async () => {
      const itens = await listarResponsaveis(turnoId);
      setLista(itens);
    })();
  }, [turnoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function adicionar() {
    if (!nome.trim()) return;
    await criarResponsavel({
      turnoId,
      nome: nome.trim(),
      empresa: empresaOutra.trim() ? Empresa.Outra : Empresa.CPTM,
      empresaOutra: empresaOutra.trim() || undefined,
    });
    setNome('');
    setEmpresaOutra('');
    carregar();
  }

  async function excluir(idResponsavel: string) {
    await removerResponsavel(idResponsavel);
    carregar();
  }

  return (
    <Tela style={styles.container}>
      <ThemedText type="title">Responsáveis</ThemedText>

      <View style={styles.card}>
        <ThemedText type="defaultSemiBold">Adicionar</ThemedText>
        <TextInput
          value={nome}
          onChangeText={setNome}
          placeholder="Nome"
          placeholderTextColor="#687076"
          style={styles.input}
        />
        <TextInput
          value={empresaOutra}
          onChangeText={setEmpresaOutra}
          placeholder="Empresa (opcional)"
          placeholderTextColor="#687076"
          style={styles.input}
        />
        <Pressable style={styles.botao} onPress={adicionar}>
          <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
            Adicionar
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.lista}>
        {lista.length === 0 ? (
          <ThemedText>Nenhum responsável cadastrado.</ThemedText>
        ) : (
          lista.map((r) => (
            <View key={r.id} style={styles.item}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{r.nome}</ThemedText>
                <ThemedText>
                  {r.empresa}
                  {r.empresaOutra ? ` (${r.empresaOutra})` : ''}
                </ThemedText>
              </View>
              <Pressable onPress={() => excluir(r.id)} style={styles.botaoExcluir}>
                <ThemedText style={styles.excluirTexto}>Excluir</ThemedText>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111',
  },
  botao: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff' },
  lista: { gap: 10 },
  item: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
  },
  botaoExcluir: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
  },
  excluirTexto: { opacity: 0.85 },
});


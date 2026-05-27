import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Tela } from '@/components/tela';
import { ThemedText } from '@/components/themed-text';
import type { FalhaAtividade } from '@/src/domain/types';
import { atualizarFalha, pegarFalhaPorId } from '@/src/data/repositories';

export default function FalhaDetalheScreen() {
  const { falhaId } = useLocalSearchParams<{ falhaId: string }>();
  const id = String(falhaId);

  const [falha, setFalha] = useState<FalhaAtividade | null>(null);
  const [descricao, setDescricao] = useState('');
  const [acoes, setAcoes] = useState('');

  useEffect(() => {
    void (async () => {
      const f = await pegarFalhaPorId(id);
      setFalha(f);
      setDescricao(f?.descricaoDefeito ?? '');
      setAcoes(f?.acoesRealizadas ?? '');
    })();
  }, [id]);

  async function salvar() {
    if (!falha) return;
    await atualizarFalha({
      ...falha,
      descricaoDefeito: descricao,
      acoesRealizadas: acoes,
    });
  }

  return (
    <Tela style={styles.container}>
      <ThemedText type="title">Falha</ThemedText>
      {falha ? (
        <View style={styles.card}>
          <ThemedText type="defaultSemiBold">{falha.tituloDefeito}</ThemedText>
          <ThemedText>{falha.local}</ThemedText>
          <ThemedText style={styles.mini}>
            {falha.situacao} • {falha.status} • {falha.prioridade}
          </ThemedText>
        </View>
      ) : (
        <ThemedText>Carregando...</ThemedText>
      )}

      <View style={styles.campo}>
        <ThemedText type="defaultSemiBold">Descrição</ThemedText>
        <TextInput
          value={descricao}
          onChangeText={setDescricao}
          multiline
          placeholder="Descrição do defeito"
          placeholderTextColor="#687076"
          style={[styles.input, styles.multiline]}
        />
      </View>

      <View style={styles.campo}>
        <ThemedText type="defaultSemiBold">Ações</ThemedText>
        <TextInput
          value={acoes}
          onChangeText={setAcoes}
          multiline
          placeholder="Ações realizadas"
          placeholderTextColor="#687076"
          style={[styles.input, styles.multiline]}
        />
      </View>

      <Pressable style={styles.botao} onPress={salvar}>
        <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
          Salvar
        </ThemedText>
      </Pressable>
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
    gap: 6,
  },
  mini: { opacity: 0.75 },
  campo: { gap: 6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111',
  },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
  botao: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff' },
});


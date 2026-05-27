import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CampoTexto } from '@/components/campo-texto';
import { TelaTeclado } from '@/components/tela-teclado';
import { ThemedText } from '@/components/themed-text';
import { atualizarFalha, pegarFalhaPorId } from '@/src/data/repositories';
import type { FalhaAtividade } from '@/src/domain/types';

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
    <TelaTeclado style={styles.container}>
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

      <CampoTexto
        label="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Descrição do defeito"
        multiline
      />

      <CampoTexto
        label="Ações"
        value={acoes}
        onChangeText={setAcoes}
        placeholder="Ações realizadas"
        multiline
      />

      <Pressable style={styles.botao} onPress={salvar}>
        <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
          Salvar
        </ThemedText>
      </Pressable>
    </TelaTeclado>
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
  botao: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff' },
});


import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CampoTexto } from '@/components/campo-texto';
import { TelaTeclado } from '@/components/tela-teclado';
import { ThemedText } from '@/components/themed-text';
import { criarFalha, listarFalhas, removerFalha } from '@/src/data/repositories';
import { Prioridade, SituacaoFalha, StatusFalha } from '@/src/domain/enums';
import type { FalhaAtividade } from '@/src/domain/types';

export default function FalhasScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const turnoId = String(id);

  const [titulo, setTitulo] = useState('');
  const [local, setLocal] = useState('');
  const [registrou, setRegistrou] = useState('');
  const [lista, setLista] = useState<FalhaAtividade[]>([]);

  const carregar = useCallback(() => {
    void (async () => {
      const itens = await listarFalhas(turnoId);
      setLista(itens);
    })();
  }, [turnoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function adicionar() {
    if (!titulo.trim()) return;
    await criarFalha({
      turnoId,
      numeroFalha: undefined,
      local: local.trim() || '-',
      situacao: SituacaoFalha.Pendente,
      status: StatusFalha.Aberta,
      prioridade: Prioridade.Media,
      tituloDefeito: titulo.trim(),
      descricaoDefeito: '',
      acoesRealizadas: '',
      proximoTurnoAcompanhar: false,
      nomeRegistrou: registrou.trim() || 'Não informado',
      nomeEditou: undefined,
    });
    setTitulo('');
    setLocal('');
    setRegistrou('');
    carregar();
  }

  async function excluir(idFalha: string) {
    await removerFalha(idFalha);
    carregar();
  }

  return (
    <TelaTeclado style={styles.container}>
      <ThemedText type="title">Falhas/atividades</ThemedText>

      <View style={styles.card}>
        <ThemedText type="defaultSemiBold">Adicionar</ThemedText>
        <CampoTexto
          label="Título do defeito"
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Título do defeito"
        />
        <CampoTexto label="Local" value={local} onChangeText={setLocal} placeholder="Local" />
        <CampoTexto
          label="Quem registrou"
          value={registrou}
          onChangeText={setRegistrou}
          placeholder="Quem registrou"
        />
        <Pressable style={styles.botao} onPress={adicionar}>
          <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
            Adicionar
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.lista}>
        {lista.length === 0 ? (
          <ThemedText>Nenhuma falha/atividade registrada.</ThemedText>
        ) : (
          lista.map((f) => (
            <View key={f.id} style={styles.item}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{f.tituloDefeito}</ThemedText>
                <ThemedText>{f.local}</ThemedText>
                <ThemedText style={styles.mini}>
                  {f.situacao} • {f.status} • {f.prioridade}
                </ThemedText>
              </View>
              <View style={styles.acoes}>
                <Pressable
                  style={styles.botaoAcao}
                  onPress={() => router.push(`/turno/${turnoId}/falha/${f.id}` as any)}>
                  <ThemedText>Ver</ThemedText>
                </Pressable>
                <Pressable onPress={() => excluir(f.id)} style={styles.botaoAcao}>
                  <ThemedText>Excluir</ThemedText>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
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
    gap: 8,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  mini: { opacity: 0.75 },
  acoes: { flexDirection: 'row', gap: 8 },
  botaoAcao: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
  },
});


import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CampoTexto } from '@/components/campo-texto';
import { SelectOpcao } from '@/components/select-opcao';
import { TopoVoltar } from '@/components/topo-voltar';
import { TelaTeclado } from '@/components/tela-teclado';
import { ThemedText } from '@/components/themed-text';
import { atualizarFalha, pegarFalhaPorId } from '@/src/data/repositories';
import { Prioridade, SituacaoFalha, StatusFalha } from '@/src/domain/enums';
import type { FalhaAtividade } from '@/src/domain/types';

const OPCOES_SITUACAO = Object.values(SituacaoFalha).map((v) => ({ label: v, value: v }));
const OPCOES_STATUS = Object.values(StatusFalha).map((v) => ({ label: v, value: v }));
const OPCOES_PRIORIDADE = Object.values(Prioridade).map((v) => ({ label: v, value: v }));

export default function FalhaDetalheScreen() {
  const { falhaId } = useLocalSearchParams<{ falhaId: string }>();
  const id = String(falhaId);

  const [falha, setFalha] = useState<FalhaAtividade | null>(null);
  const [situacao, setSituacao] = useState<SituacaoFalha>(SituacaoFalha.Pendente);
  const [status, setStatus] = useState<StatusFalha>(StatusFalha.Aberta);
  const [prioridade, setPrioridade] = useState<Prioridade>(Prioridade.Media);
  const [descricao, setDescricao] = useState('');
  const [acoes, setAcoes] = useState('');

  useEffect(() => {
    void (async () => {
      const f = await pegarFalhaPorId(id);
      setFalha(f);
      if (!f) return;
      setSituacao(f.situacao);
      setStatus(f.status);
      setPrioridade(f.prioridade);
      setDescricao(f.descricaoDefeito ?? '');
      setAcoes(f.acoesRealizadas ?? '');
    })();
  }, [id]);

  async function salvar() {
    if (!falha) return;
    await atualizarFalha({
      ...falha,
      situacao,
      status,
      prioridade,
      descricaoDefeito: descricao,
      acoesRealizadas: acoes,
    });
  }

  return (
    <TelaTeclado style={styles.container}>
      <TopoVoltar titulo="Falha" />

      {falha ? (
        <View style={[styles.card, styles.secao]}>
          <ThemedText type="defaultSemiBold">{falha.tituloDefeito}</ThemedText>
          <ThemedText>{falha.local}</ThemedText>
          <ThemedText style={styles.mini}>Registrado por: {falha.nomeRegistrou}</ThemedText>
        </View>
      ) : (
        <ThemedText style={styles.secao}>Carregando...</ThemedText>
      )}

      <View style={styles.campo}>
        <SelectOpcao label="Situação" value={situacao} opcoes={OPCOES_SITUACAO} onChange={setSituacao} obrigatorio />
      </View>
      <View style={styles.campo}>
        <SelectOpcao label="Status" value={status} opcoes={OPCOES_STATUS} onChange={setStatus} obrigatorio />
      </View>
      <View style={styles.campo}>
        <SelectOpcao
          label="Prioridade"
          value={prioridade}
          opcoes={OPCOES_PRIORIDADE}
          onChange={setPrioridade}
          obrigatorio
        />
      </View>

      <View style={styles.campo}>
        <CampoTexto
          label="Descrição"
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descrição do defeito"
          multiline
        />
      </View>

      <View style={styles.campo}>
        <CampoTexto
          label="Ações"
          value={acoes}
          onChangeText={setAcoes}
          placeholder="Ações realizadas"
          multiline
        />
      </View>

      <Pressable style={styles.botao} onPress={salvar}>
        <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
          Salvar
        </ThemedText>
      </Pressable>
    </TelaTeclado>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  secao: {
    marginBottom: 20,
  },
  campo: {
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
  botao: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff' },
});

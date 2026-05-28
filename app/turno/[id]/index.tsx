import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Keyboard, Pressable, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { CampoTexto } from '@/components/campo-texto';
import { SelectOpcao } from '@/components/select-opcao';
import { TelaTeclado } from '@/components/tela-teclado';
import { ThemedText } from '@/components/themed-text';
import { TopoVoltar } from '@/components/topo-voltar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, corBotao } from '@/constants/theme';
import {
  criarAtividade,
  listarAtividades,
  listarResponsaveis,
  pegarTurnoPorId,
  removerAtividade,
} from '@/src/data/repositories';
import { SituacaoAtividade, StatusAtividade } from '@/src/domain/enums';
import type { Atividade, Turno } from '@/src/domain/types';
import { capturarFotoParaAtividade } from '@/src/features/imagens/adicionarImagemAtividade';

const OPCOES_SITUACAO = Object.values(SituacaoAtividade).map((v) => ({ label: v, value: v }));
const OPCOES_STATUS = Object.values(StatusAtividade).map((v) => ({ label: v, value: v }));

export default function TurnoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const turnoId = String(id);
  const corIcone = Colors.light.icon;
  const corIconeAcao = Colors.light.tint;

  const [turno, setTurno] = useState<Turno | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [qtdResponsaveis, setQtdResponsaveis] = useState(0);

  const [novaExpandida, setNovaExpandida] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [local, setLocal] = useState('');
  const [registrou, setRegistrou] = useState('');
  const [situacao, setSituacao] = useState<SituacaoAtividade>(SituacaoAtividade.Pendente);
  const [status, setStatus] = useState<StatusAtividade>(StatusAtividade.Aberta);

  const carregar = useCallback(() => {
    void (async () => {
      const [t, lista, responsaveis] = await Promise.all([
        pegarTurnoPorId(turnoId),
        listarAtividades(turnoId),
        listarResponsaveis(turnoId),
      ]);
      setTurno(t);
      setAtividades(lista);
      setQtdResponsaveis(responsaveis.length);
    })();
  }, [turnoId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function adicionarAtividade() {
    if (!titulo.trim()) return;
    await criarAtividade({
      turnoId,
      numeroAtividade: undefined,
      local: local.trim() || '-',
      situacao,
      status,
      tituloDefeito: titulo.trim(),
      descricaoDefeito: '',
      acoesRealizadas: '',
      nomeRegistrou: registrou.trim() || 'Não informado',
      nomeEditou: undefined,
    });
    Keyboard.dismiss();
    setTitulo('');
    setLocal('');
    setRegistrou('');
    setSituacao(SituacaoAtividade.Pendente);
    setStatus(StatusAtividade.Aberta);
    setNovaExpandida(false);
    carregar();
  }

  async function excluirAtividade(idAtividade: string) {
    Alert.alert('Excluir atividade', 'Tem certeza que deseja excluir esta atividade?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await removerAtividade(idAtividade);
            carregar();
          })();
        },
      },
    ]);
  }

  async function tirarFotoAtividade(atividadeId: string) {
    const resultado = await capturarFotoParaAtividade(atividadeId);
    if (resultado === 'ok') {
      Toast.show({ type: 'success', text1: 'Foto adicionada', position: 'top', visibilityTime: 2000 });
    } else if (resultado === 'sem_permissao') {
      Toast.show({
        type: 'error',
        text1: 'Permissão da câmera negada',
        text2: 'Ative nas configurações do aparelho',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  }

  const tituloTela = turno ? `Turno ${turno.data}` : 'Turno';

  return (
    <TelaTeclado style={styles.container}>
      <TopoVoltar
        titulo={tituloTela}
        acaoDireita={
          <Pressable
            onPress={() => router.push(`/turno/${turnoId}/editar` as any)}
            style={styles.botaoAcaoTopo}
            accessibilityLabel="Editar turno">
            <IconSymbol name="square.and.pencil" size={20} color={corIconeAcao} />
          </Pressable>
        }
      />

      {turno ? (
        <View style={[styles.card, styles.secao, { marginTop: 20 }]}>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Local:</ThemedText> {turno.localizacao}
          </ThemedText>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Tipo:</ThemedText>{' '}
            {(turno.tiposManutencao?.length ? turno.tiposManutencao : ['Acompanhamento']).join(', ')}
          </ThemedText>
          {turno.horaInicio || turno.horaFim ? (
            <ThemedText>
              <ThemedText type="defaultSemiBold">Horário:</ThemedText>{' '}
              {turno.horaInicio ?? '—'} – {turno.horaFim ?? '—'}
            </ThemedText>
          ) : null}
          <ThemedText>
            <ThemedText type="defaultSemiBold">Status:</ThemedText> {turno.status}
          </ThemedText>

          <Pressable
            style={styles.linkResponsaveis}
            onPress={() => router.push(`/turno/${turnoId}/responsaveis` as any)}>
            <ThemedText type="defaultSemiBold">
              Responsáveis na escala ({qtdResponsaveis})
            </ThemedText>
            <IconSymbol name="chevron.right" size={18} color={corIcone} />
          </Pressable>
        </View>
      ) : (
        <ThemedText style={styles.secao}>Carregando...</ThemedText>
      )}

      <View style={styles.card}>
        <ThemedText type="defaultSemiBold" style={styles.tituloSecao}>
          Atividades ({atividades.length})
        </ThemedText>

        {atividades.length === 0 ? (
          <ThemedText style={styles.vazio}>
            Nenhuma atividade registrada. Use o botão abaixo para adicionar.
          </ThemedText>
        ) : (
          atividades.map((f) => (
            <View key={f.id} style={styles.itemAtividade}>
              <Pressable
                style={styles.itemAtividadeConteudo}
                onPress={() => router.push(`/turno/${turnoId}/atividade/${f.id}` as any)}>
                <ThemedText type="defaultSemiBold">{f.tituloDefeito}</ThemedText>
                <ThemedText>{f.local}</ThemedText>
                <ThemedText style={styles.mini}>
                  {f.situacao} • {f.status}
                </ThemedText>
              </Pressable>
              <View style={styles.acoesAtividade}>
                <Pressable style={styles.botaoExcluir} onPress={() => void excluirAtividade(f.id)}>
                  <ThemedText style={styles.excluirTexto}>Excluir</ThemedText>
                </Pressable>
                <Pressable
                  style={styles.botaoFoto}
                  onPress={() => void tirarFotoAtividade(f.id)}
                  accessibilityLabel="Tirar foto">
                  <IconSymbol name="camera" size={20} color={corIconeAcao} />
                </Pressable>
              </View>
            </View>
          ))
        )}

        <View style={styles.divisor} />

        <Pressable style={styles.cabecalhoExpansivel} onPress={() => setNovaExpandida((v) => !v)}>
          <IconSymbol
            name="chevron.right"
            size={18}
            color={corIcone}
            style={{ transform: [{ rotate: novaExpandida ? '90deg' : '0deg' }] }}
          />
          <View style={styles.cabecalhoTexto}>
            <ThemedText type="defaultSemiBold">Registrar atividade</ThemedText>
            {!novaExpandida ? (
              <ThemedText style={styles.descricaoRecolhida}>Toque para adicionar uma nova</ThemedText>
            ) : null}
          </View>
        </Pressable>

        {novaExpandida ? (
          <View style={styles.conteudoExpansivel}>
            <View style={styles.campo}>
              <CampoTexto
                label="Título"
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Ex: Verificação no equipamento X"
              />
            </View>
            <View style={styles.campo}>
              <CampoTexto label="Local" value={local} onChangeText={setLocal} placeholder="Local" />
            </View>
            <View style={styles.campo}>
              <CampoTexto
                label="Quem registrou"
                value={registrou}
                onChangeText={setRegistrou}
                placeholder="Seu nome"
              />
            </View>
            <View style={styles.campo}>
              <SelectOpcao label="Situação" value={situacao} opcoes={OPCOES_SITUACAO} onChange={setSituacao} />
            </View>
            <View style={styles.campo}>
              <SelectOpcao label="Status" value={status} opcoes={OPCOES_STATUS} onChange={setStatus} />
            </View>
            <Pressable style={styles.botao} onPress={adicionarAtividade}>
              <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
                Adicionar
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.atalhos}>
        <Pressable style={styles.atalho} onPress={() => router.push(`/turno/${turnoId}/pdf` as any)}>
          <ThemedText type="defaultSemiBold">Pré-visualizar PDF</ThemedText>
        </Pressable>
      </View>
    </TelaTeclado>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  secao: {
    marginBottom: 20,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  tituloSecao: {
    marginBottom: 12,
  },
  vazio: {
    opacity: 0.75,
    marginBottom: 12,
  },
  linkResponsaveis: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#687076',
  },
  itemAtividade: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemAtividadeConteudo: {
    flex: 1,
    gap: 4,
  },
  mini: {
    opacity: 0.75,
    fontSize: 13,
  },
  acoesAtividade: {
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
  botaoFoto: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    alignItems: 'center',
    justifyContent: 'center',
  },
  excluirTexto: {
    fontSize: 13,
    opacity: 0.85,
  },
  divisor: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#687076',
    marginVertical: 12,
  },
  cabecalhoExpansivel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cabecalhoTexto: {
    flex: 1,
    gap: 4,
  },
  descricaoRecolhida: {
    opacity: 0.75,
    fontSize: 13,
  },
  conteudoExpansivel: {
    marginTop: 16,
  },
  campo: {
    marginBottom: 20,
  },
  botao: {
    backgroundColor: corBotao,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
  },
  atalhos: {
    marginBottom: 20,
  },
  atalho: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  botaoAcaoTopo: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
  },
});

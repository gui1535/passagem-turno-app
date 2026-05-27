import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { CampoTexto } from '@/components/campo-texto';
import { SelectOpcao } from '@/components/select-opcao';
import { TopoVoltar } from '@/components/topo-voltar';
import { TelaTeclado } from '@/components/tela-teclado';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { capturarFotoParaFalha } from '@/src/features/imagens/adicionarImagemFalha';
import type { FalhaAtividade, Turno } from '@/src/domain/types';
import {
  criarFalha,
  listarFalhas,
  listarResponsaveis,
  pegarTurnoPorId,
  removerFalha,
} from '@/src/data/repositories';
import { SituacaoFalha, StatusFalha } from '@/src/domain/enums';

const OPCOES_SITUACAO = Object.values(SituacaoFalha).map((v) => ({ label: v, value: v }));
const OPCOES_STATUS = Object.values(StatusFalha).map((v) => ({ label: v, value: v }));

export default function TurnoDetalheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const turnoId = String(id);
  const tema = useColorScheme() ?? 'light';
  const corIcone = tema === 'light' ? Colors.light.icon : Colors.dark.icon;
  const corTint = useThemeColor({}, 'tint');

  const [turno, setTurno] = useState<Turno | null>(null);
  const [falhas, setFalhas] = useState<FalhaAtividade[]>([]);
  const [qtdResponsaveis, setQtdResponsaveis] = useState(0);

  const [novaExpandida, setNovaExpandida] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [local, setLocal] = useState('');
  const [registrou, setRegistrou] = useState('');
  const [situacao, setSituacao] = useState<SituacaoFalha>(SituacaoFalha.Pendente);
  const [status, setStatus] = useState<StatusFalha>(StatusFalha.Aberta);

  const carregar = useCallback(() => {
    void (async () => {
      const [t, lista, responsaveis] = await Promise.all([
        pegarTurnoPorId(turnoId),
        listarFalhas(turnoId),
        listarResponsaveis(turnoId),
      ]);
      setTurno(t);
      setFalhas(lista);
      setQtdResponsaveis(responsaveis.length);
    })();
  }, [turnoId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function adicionarFalha() {
    if (!titulo.trim()) return;
    await criarFalha({
      turnoId,
      numeroFalha: undefined,
      local: local.trim() || '-',
      situacao,
      status,
      tituloDefeito: titulo.trim(),
      descricaoDefeito: '',
      acoesRealizadas: '',
      proximoTurnoAcompanhar: false,
      nomeRegistrou: registrou.trim() || 'Não informado',
      nomeEditou: undefined,
    });
    Keyboard.dismiss();
    setTitulo('');
    setLocal('');
    setRegistrou('');
    setSituacao(SituacaoFalha.Pendente);
    setStatus(StatusFalha.Aberta);
    setNovaExpandida(false);
    carregar();
  }

  async function excluirFalha(idFalha: string) {
    await removerFalha(idFalha);
    carregar();
  }

  async function tirarFotoFalha(falhaId: string) {
    const resultado = await capturarFotoParaFalha(falhaId);
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
      <TopoVoltar titulo={tituloTela} />

      {turno ? (
        <View style={[styles.card, styles.secao, { marginTop: 20 }]}>
          <ThemedText>
            <ThemedText type="defaultSemiBold">Local:</ThemedText> {turno.localizacao}
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
          Falhas e atividades ({falhas.length})
        </ThemedText>

        {falhas.length === 0 ? (
          <ThemedText style={styles.vazio}>
            Nenhuma falha registrada. Use o botão abaixo para adicionar.
          </ThemedText>
        ) : (
          falhas.map((f) => (
            <View key={f.id} style={styles.itemFalha}>
              <Pressable
                style={styles.itemFalhaConteudo}
                onPress={() => router.push(`/turno/${turnoId}/falha/${f.id}` as any)}>
                <ThemedText type="defaultSemiBold">{f.tituloDefeito}</ThemedText>
                <ThemedText>{f.local}</ThemedText>
                <ThemedText style={styles.mini}>
                  {f.situacao} • {f.status}
                </ThemedText>
              </Pressable>
              <View style={styles.acoesFalha}>
                <Pressable style={styles.botaoExcluir} onPress={() => void excluirFalha(f.id)}>
                  <ThemedText style={styles.excluirTexto}>Excluir</ThemedText>
                </Pressable>
                <Pressable
                  style={styles.botaoFoto}
                  onPress={() => void tirarFotoFalha(f.id)}
                  accessibilityLabel="Tirar foto">
                  <IconSymbol name="camera" size={20} color={corTint} />
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
            <ThemedText type="defaultSemiBold">Registrar falha</ThemedText>
            {!novaExpandida ? (
              <ThemedText style={styles.descricaoRecolhida}>Toque para adicionar uma nova</ThemedText>
            ) : null}
          </View>
        </Pressable>

        {novaExpandida ? (
          <View style={styles.conteudoExpansivel}>
            <View style={styles.campo}>
              <CampoTexto
                label="Título do defeito"
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Ex: Falha no equipamento X"
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
            <Pressable style={styles.botao} onPress={adicionarFalha}>
              <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
                Adicionar
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.atalhos}>
        <Pressable style={styles.atalho} onPress={() => router.push(`/turno/${turnoId}/revisao` as any)}>
          <ThemedText type="defaultSemiBold">Revisão</ThemedText>
        </Pressable>
        <Pressable style={styles.atalho} onPress={() => router.push(`/turno/${turnoId}/pdf` as any)}>
          <ThemedText type="defaultSemiBold">Gerar PDF</ThemedText>
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
  itemFalha: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemFalhaConteudo: {
    flex: 1,
    gap: 4,
  },
  mini: {
    opacity: 0.75,
    fontSize: 13,
  },
  acoesFalha: {
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
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
  },
  atalhos: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  atalho: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
});

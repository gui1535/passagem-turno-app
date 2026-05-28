import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { CampoTexto } from '@/components/campo-texto';
import { FotosFalha, tirarFotoDaFalha } from '@/components/fotos-falha';
import { SecaoDropdown } from '@/components/secao-dropdown';
import { SelectOpcao } from '@/components/select-opcao';
import { TelaFormularioFixo } from '@/components/tela-formulario-fixo';
import { ThemedText } from '@/components/themed-text';
import { TopoVoltar } from '@/components/topo-voltar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { corBotao } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { atualizarFalha, pegarFalhaPorId } from '@/src/data/repositories';
import { SituacaoFalha, StatusFalha } from '@/src/domain/enums';
import type { FalhaAtividade } from '@/src/domain/types';

const OPCOES_SITUACAO = Object.values(SituacaoFalha).map((v) => ({ label: v, value: v }));
const OPCOES_STATUS = Object.values(StatusFalha).map((v) => ({ label: v, value: v }));

export default function FalhaDetalheScreen() {
  const { falhaId } = useLocalSearchParams<{ falhaId: string }>();
  const id = String(falhaId);
  const corIconeAcao = useThemeColor({}, 'tint');

  const [falha, setFalha] = useState<FalhaAtividade | null>(null);
  const [titulo, setTitulo] = useState('');
  const [local, setLocal] = useState('');
  const [registrou, setRegistrou] = useState('');
  const [situacao, setSituacao] = useState<SituacaoFalha>(SituacaoFalha.Pendente);
  const [status, setStatus] = useState<StatusFalha>(StatusFalha.Aberta);
  const [descricao, setDescricao] = useState('');
  const [acoes, setAcoes] = useState('');
  const [fotosKey, setFotosKey] = useState(0);
  const [abrindoCamera, setAbrindoCamera] = useState(false);

  const carregar = useCallback(() => {
    void (async () => {
      const f = await pegarFalhaPorId(id);
      setFalha(f);
      if (!f) return;
      setTitulo(f.tituloDefeito);
      setLocal(f.local === '-' ? '' : f.local);
      setRegistrou(f.nomeRegistrou === 'Não informado' ? '' : f.nomeRegistrou);
      setSituacao(f.situacao);
      setStatus(f.status);
      setDescricao(f.descricaoDefeito ?? '');
      setAcoes(f.acoesRealizadas ?? '');
    })();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function salvar() {
    if (!falha || !titulo.trim()) return;
    await atualizarFalha({
      ...falha,
      tituloDefeito: titulo.trim(),
      local: local.trim() || '-',
      nomeRegistrou: registrou.trim() || 'Não informado',
      situacao,
      status,
      descricaoDefeito: descricao,
      acoesRealizadas: acoes,
    });
    Toast.show({ type: 'success', text1: 'Falha salva com sucesso', position: 'top', visibilityTime: 2000 });
    router.back();
  }

  async function tirarFoto() {
    if (abrindoCamera) return;
    setAbrindoCamera(true);
    try {
      const ok = await tirarFotoDaFalha(id);
      if (ok) setFotosKey((k) => k + 1);
    } finally {
      setAbrindoCamera(false);
    }
  }

  return (
    <TelaFormularioFixo
      header={
        <TopoVoltar
          titulo="Falha"
          acaoDireita={
            <Pressable
              onPress={() => void tirarFoto()}
              style={styles.botaoHeader}
              disabled={abrindoCamera}
              accessibilityLabel="Tirar foto">
              {abrindoCamera ? (
                <ActivityIndicator size="small" color={corIconeAcao} />
              ) : (
                <IconSymbol name="camera" size={22} color={corIconeAcao} />
              )}
            </Pressable>
          }
        />
      }
      footer={
        <Pressable style={styles.botao} onPress={() => void salvar()}>
          <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
            Salvar
          </ThemedText>
        </Pressable>
      }>
      {falha ? (
        <>
          <SecaoDropdown titulo="Ocorrência" descricao="Identifique o que aconteceu e onde." >
            <View style={styles.campo}>
              <CampoTexto
                label="Título do defeito"
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Ex: Falha no equipamento X"
                obrigatorio
              />
            </View>
            <View style={styles.campo}>
              <CampoTexto label="Local" value={local} onChangeText={setLocal} placeholder="Ex: CCO, sala 2" />
            </View>
            <CampoTexto
              label="Registrado por"
              value={registrou}
              onChangeText={setRegistrou}
              placeholder="Nome de quem registrou"
            />
          </SecaoDropdown>

          <SecaoDropdown titulo="Classificação" descricao="Situação atual e andamento do atendimento.">
            <View style={styles.linha}>
              <View style={styles.coluna}>
                <SelectOpcao
                  label="Situação"
                  value={situacao}
                  opcoes={OPCOES_SITUACAO}
                  onChange={setSituacao}
                  obrigatorio
                />
              </View>
              <View style={styles.coluna}>
                <SelectOpcao label="Status" value={status} opcoes={OPCOES_STATUS} onChange={setStatus} obrigatorio />
              </View>
            </View>
          </SecaoDropdown>

          <SecaoDropdown titulo="Detalhamento" descricao="Descreva o problema e o que foi feito.">
            <View style={styles.campo}>
              <CampoTexto
                label="Descrição"
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descrição do defeito"
                multiline
              />
            </View>
            <CampoTexto
              label="Ações realizadas"
              value={acoes}
              onChangeText={setAcoes}
              placeholder="O que foi feito"
              multiline
            />
          </SecaoDropdown>

          <View style={styles.cardFotos}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitulo}>
              Fotos
            </ThemedText>
            <ThemedText style={styles.cardDescricao}>Registros visuais desta ocorrência.</ThemedText>
            <FotosFalha key={fotosKey} falhaId={id} semCabecalho />
          </View>
        </>
      ) : (
        <ThemedText>Carregando...</ThemedText>
      )}
    </TelaFormularioFixo>
  );
}

const styles = StyleSheet.create({
  cardFotos: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  cardTitulo: {
    marginBottom: 4,
  },
  cardDescricao: {
    opacity: 0.75,
    fontSize: 13,
    marginBottom: 16,
  },
  campo: {
    marginBottom: 20,
  },
  linha: {
    flexDirection: 'row',
    gap: 12,
  },
  coluna: {
    flex: 1,
  },
  botaoHeader: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botao: {
    backgroundColor: corBotao,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff' },
});

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { CampoTexto } from '@/components/campo-texto';
import { FotosAtividade, tirarFotoDaAtividade } from '@/components/fotos-atividade';
import { SecaoDropdown } from '@/components/secao-dropdown';
import { SelectOpcao } from '@/components/select-opcao';
import { TelaFormularioFixo } from '@/components/tela-formulario-fixo';
import { ThemedText } from '@/components/themed-text';
import { TopoVoltar } from '@/components/topo-voltar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { corBotao } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { atualizarAtividade, pegarAtividadePorId } from '@/src/data/repositories';
import { SituacaoAtividade } from '@/src/domain/enums';
import type { Atividade } from '@/src/domain/types';

const OPCOES_SITUACAO = Object.values(SituacaoAtividade).map((v) => ({ label: v, value: v }));

export default function AtividadeDetalheScreen() {
  const { atividadeId } = useLocalSearchParams<{ atividadeId: string }>();
  const id = String(atividadeId);
  const corIconeAcao = useThemeColor({}, 'tint');

  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [titulo, setTitulo] = useState('');
  const [local, setLocal] = useState('');
  const [registrou, setRegistrou] = useState('');
  const [situacao, setSituacao] = useState<SituacaoAtividade>(SituacaoAtividade.Pendente);
  const [descricao, setDescricao] = useState('');
  const [acoes, setAcoes] = useState('');
  const [fotosKey, setFotosKey] = useState(0);
  const [abrindoCamera, setAbrindoCamera] = useState(false);

  const carregar = useCallback(() => {
    void (async () => {
      const a = await pegarAtividadePorId(id);
      setAtividade(a);
      if (!a) return;
      setTitulo(a.tituloDefeito);
      setLocal(a.local === '-' ? '' : a.local);
      setRegistrou(a.nomeRegistrou === 'Não informado' ? '' : a.nomeRegistrou);
      setSituacao(a.situacao);
      setDescricao(a.descricaoDefeito ?? '');
      setAcoes(a.acoesRealizadas ?? '');
    })();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  async function salvar() {
    if (!atividade || !titulo.trim()) return;
    await atualizarAtividade({
      ...atividade,
      tituloDefeito: titulo.trim(),
      local: local.trim() || '-',
      nomeRegistrou: registrou.trim() || 'Não informado',
      situacao,
      descricaoDefeito: descricao,
      acoesRealizadas: acoes,
    });
    Toast.show({ type: 'success', text1: 'Atividade salva com sucesso', position: 'top', visibilityTime: 2000 });
    router.back();
  }

  async function tirarFoto() {
    if (abrindoCamera) return;
    setAbrindoCamera(true);
    try {
      const ok = await tirarFotoDaAtividade(id);
      if (ok) setFotosKey((k) => k + 1);
    } finally {
      setAbrindoCamera(false);
    }
  }

  return (
    <TelaFormularioFixo
      header={
        <TopoVoltar
          titulo="Atividade"
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
      {atividade ? (
        <>
          <SecaoDropdown titulo="Identificação" descricao="O que foi registrado e onde.">
            <View style={styles.campo}>
              <CampoTexto
                label="Título"
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Ex: Verificação no equipamento X"
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

          <SecaoDropdown titulo="Classificação" descricao="Situação atual da atividade.">
            <SelectOpcao
              label="Situação"
              value={situacao}
              opcoes={OPCOES_SITUACAO}
              onChange={setSituacao}
              obrigatorio
            />
          </SecaoDropdown>

          <SecaoDropdown titulo="Detalhamento" descricao="Descreva a atividade e o que foi feito.">
            <View style={styles.campo}>
              <CampoTexto
                label="Descrição"
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descrição da atividade"
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
            <ThemedText style={styles.cardDescricao}>Registros visuais desta atividade.</ThemedText>
            <FotosAtividade key={fotosKey} atividadeId={id} semCabecalho />
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

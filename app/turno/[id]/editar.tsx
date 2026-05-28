import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { CampoDataHora } from '@/components/campo-data-hora';
import { CampoTexto } from '@/components/campo-texto';
import { TelaTeclado } from '@/components/tela-teclado';
import { ThemedText } from '@/components/themed-text';
import { TopoVoltar } from '@/components/topo-voltar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, corBotao } from '@/constants/theme';
import { atualizarTurno, pegarTurnoPorId } from '@/src/data/repositories';
import { TipoManutencaoTurno } from '@/src/domain/enums';
import type { Turno } from '@/src/domain/types';

export default function EditarTurnoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const turnoId = String(id);

  const corIconeAcao = Colors.light.tint;

  const [carregando, setCarregando] = useState(true);
  const [turno, setTurno] = useState<Turno | null>(null);

  const [data, setData] = useState<Date | null>(null);
  const [horaInicio, setHoraInicio] = useState<Date | null>(null);
  const [horaFim, setHoraFim] = useState<Date | null>(null);
  const [localizacao, setLocalizacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tiposManutencao, setTiposManutencao] = useState<TipoManutencaoTurno[]>([
    TipoManutencaoTurno.Acompanhamento,
  ]);

  const carregar = useCallback(() => {
    void (async () => {
      setCarregando(true);
      try {
        const t = await pegarTurnoPorId(turnoId);
        setTurno(t);
        if (!t) return;

        setData(parseDataBr(t.data));
        setHoraInicio(t.horaInicio ? parseHora(t.horaInicio) : null);
        setHoraFim(t.horaFim ? parseHora(t.horaFim) : null);
        setLocalizacao(t.localizacao ?? '');
        setDescricao(t.descricaoAtividadeDoDia ?? '');
        setTiposManutencao(
          t.tiposManutencao?.length ? t.tiposManutencao : [TipoManutencaoTurno.Acompanhamento]
        );
      } finally {
        setCarregando(false);
      }
    })();
  }, [turnoId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function alternarTipo(t: TipoManutencaoTurno) {
    setTiposManutencao((atual) => {
      const tem = atual.includes(t);
      const novo = tem ? atual.filter((x) => x !== t) : [...atual, t];
      return novo.length > 0 ? novo : [TipoManutencaoTurno.Acompanhamento];
    });
  }

  async function salvar() {
    if (!turno) return;

    const atualizado: Turno = {
      ...turno,
      data: (data ?? new Date()).toLocaleDateString('pt-BR'),
      horaInicio: horaInicio
        ? horaInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : undefined,
      horaFim: horaFim
        ? horaFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : undefined,
      localizacao: localizacao.trim() || 'CCO',
      descricaoAtividadeDoDia: descricao.trim() || '',
      tiposManutencao,
    };

    await atualizarTurno(atualizado);
    Toast.show({ type: 'success', text1: 'Turno atualizado', position: 'top', visibilityTime: 2000 });
    router.back();
  }

  return (
    <TelaTeclado style={styles.container}>
      <TopoVoltar titulo="Editar turno" />

      {carregando ? (
        <ThemedText style={styles.estado}>Carregando...</ThemedText>
      ) : !turno ? (
        <ThemedText style={styles.estado}>Turno não encontrado.</ThemedText>
      ) : (
        <>
          <View style={[styles.campo, { marginTop: 20 }]}>
            <CampoDataHora label="Data" modo="data" valor={data} onChange={setData} />
          </View>
          <View style={[styles.linha, styles.campo]}>
            <View style={styles.coluna}>
              <CampoDataHora label="Início" modo="hora" valor={horaInicio} onChange={setHoraInicio} />
            </View>
            <View style={styles.coluna}>
              <CampoDataHora label="Fim" modo="hora" valor={horaFim} onChange={setHoraFim} />
            </View>
          </View>
          <View style={styles.campo}>
            <CampoTexto
              label="Localização"
              value={localizacao}
              onChangeText={setLocalizacao}
              placeholder="Ex: CCO"
            />
          </View>
          <View style={styles.campo}>
            <CampoTexto
              label="Descrição do dia"
              value={descricao}
              onChangeText={setDescricao}
              placeholder="O que aconteceu no turno"
              multiline
            />
          </View>

          <View style={styles.campo}>
            <ThemedText type="defaultSemiBold">Tipo</ThemedText>
            <View style={styles.tiposWrap}>
              {(
                [
                  TipoManutencaoTurno.Corretiva,
                  TipoManutencaoTurno.Preventiva,
                  TipoManutencaoTurno.Estudos,
                  TipoManutencaoTurno.Acompanhamento,
                ] as const
              ).map((t) => {
                const marcado = tiposManutencao.includes(t);
                return (
                  <Pressable
                    key={t}
                    style={[styles.itemSelecao, marcado && { borderColor: corIconeAcao }]}
                    onPress={() => alternarTipo(t)}>
                    <View
                      style={[
                        styles.checkbox,
                        marcado && [styles.checkboxSelecionado, { borderColor: corIconeAcao }],
                      ]}>
                      {marcado ? <IconSymbol name="checkmark" size={18} color={corBotao} /> : null}
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="defaultSemiBold">{t}</ThemedText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable style={styles.botao} onPress={salvar}>
            <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
              Salvar alterações
            </ThemedText>
          </Pressable>
        </>
      )}
    </TelaTeclado>
  );
}

function parseHora(hhmm: string) {
  const [hh, mm] = hhmm.split(':').map((x) => Number(x));
  const d = new Date();
  d.setHours(hh || 0, mm || 0, 0, 0);
  return d;
}

function parseDataBr(ddmmyyyy: string) {
  const [dd, mm, yyyy] = ddmmyyyy.split('/').map((x) => Number(x));
  if (!dd || !mm || !yyyy) return new Date();
  const d = new Date();
  d.setFullYear(yyyy, mm - 1, dd);
  d.setHours(12, 0, 0, 0);
  return d;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  estado: {
    marginTop: 20,
    opacity: 0.75,
  },
  campo: {
    marginBottom: 20,
    gap: 8,
  },
  linha: {
    flexDirection: 'row',
    gap: 12,
  },
  coluna: {
    flex: 1,
  },
  tiposWrap: {
    gap: 10,
  },
  itemSelecao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelecionado: {
    backgroundColor: '#fff',
    borderWidth: 2,
  },
  botao: {
    marginTop: 8,
    backgroundColor: corBotao,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
  },
});


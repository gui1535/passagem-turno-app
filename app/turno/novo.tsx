import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { CampoDataHora } from '@/components/campo-data-hora';
import { CampoTexto } from '@/components/campo-texto';
import { TopoVoltar } from '@/components/topo-voltar';
import { TelaTeclado } from '@/components/tela-teclado';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, corBotao } from '@/constants/theme';
import { criarTurno, pegarConfiguracaoApp } from '@/src/data/repositories';
import { TipoManutencaoTurno } from '@/src/domain/enums';

export default function NovoTurnoScreen() {
  const [data, setData] = useState<Date | null>(new Date());
  const [horaInicio, setHoraInicio] = useState<Date | null>(null);
  const [horaFim, setHoraFim] = useState<Date | null>(null);
  const [localizacao, setLocalizacao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tiposManutencao, setTiposManutencao] = useState<TipoManutencaoTurno[]>([
    TipoManutencaoTurno.Acompanhamento,
  ]);
  const corIconeAcao = Colors.light.tint;

  function alternarTipo(t: TipoManutencaoTurno) {
    setTiposManutencao((atual) => {
      const tem = atual.includes(t);
      const novo = tem ? atual.filter((x) => x !== t) : [...atual, t];
      return novo.length > 0 ? novo : [TipoManutencaoTurno.Acompanhamento];
    });
  }

  const carregarPadroes = useCallback(() => {
    void (async () => {
      const cfg = await pegarConfiguracaoApp();
      if (cfg?.localizacaoPadrao) setLocalizacao(cfg.localizacaoPadrao);
      if (cfg?.horaInicioPadrao) setHoraInicio(parseHora(cfg.horaInicioPadrao));
      if (cfg?.horaFimPadrao) setHoraFim(parseHora(cfg.horaFimPadrao));
    })();
  }, []);

  useFocusEffect(carregarPadroes);

  async function salvar() {
    const turno = await criarTurno({
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
    });

    router.replace(`/turno/${turno.id}`);
  }

  return (
    <TelaTeclado style={styles.container}>
      <TopoVoltar titulo="Novo turno" />

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
        <CampoTexto label="Localização" value={localizacao} onChangeText={setLocalizacao} placeholder="Ex: CCO" />
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
          Salvar e continuar
        </ThemedText>
      </Pressable>
    </TelaTeclado>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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

function parseHora(hhmm: string) {
  const [hh, mm] = hhmm.split(':').map((x) => Number(x));
  const d = new Date();
  d.setHours(hh || 0, mm || 0, 0, 0);
  return d;
}


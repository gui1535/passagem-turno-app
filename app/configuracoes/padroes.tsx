import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { CampoDataHora } from '@/components/campo-data-hora';
import { CampoTexto } from '@/components/campo-texto';
import { TopoVoltar } from '@/components/topo-voltar';
import { TelaTeclado } from '@/components/tela-teclado';
import { ThemedText } from '@/components/themed-text';
import type { ConfiguracaoApp } from '@/src/domain/types';
import { pegarConfiguracaoApp, salvarConfiguracaoApp } from '@/src/data/repositories';

export default function ConfigPadroesTurnoScreen() {
  const [nomeTurno, setNomeTurno] = useState('');
  const [localizacaoPadrao, setLocalizacaoPadrao] = useState('');
  const [horaInicio, setHoraInicio] = useState<Date | null>(null);
  const [horaFim, setHoraFim] = useState<Date | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});

  const carregar = useCallback(() => {
    void (async () => {
      const cfg = await pegarConfiguracaoApp();
      if (!cfg) return;
      setNomeTurno(cfg.nomeTurno);
      setLocalizacaoPadrao(cfg.localizacaoPadrao);
      setHoraInicio(cfg.horaInicioPadrao ? parseHora(cfg.horaInicioPadrao) : null);
      setHoraFim(cfg.horaFimPadrao ? parseHora(cfg.horaFimPadrao) : null);
    })();
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvar() {
    const e: Record<string, string> = {};
    if (!nomeTurno.trim()) e.nomeTurno = 'Obrigatório';
    if (!localizacaoPadrao.trim()) e.localizacaoPadrao = 'Obrigatório';
    if (!horaInicio) e.horaInicio = 'Obrigatório';
    if (!horaFim) e.horaFim = 'Obrigatório';
    setErros(e);
    if (Object.keys(e).length) return;

    const cfg: ConfiguracaoApp = {
      nomeTurno: nomeTurno.trim(),
      localizacaoPadrao: localizacaoPadrao.trim(),
      horaInicioPadrao: formatarHora(horaInicio!),
      horaFimPadrao: formatarHora(horaFim!),
    };
    await salvarConfiguracaoApp(cfg);
    Toast.show({ type: 'success', text1: 'Informações salvas com sucesso', position: 'top',visibilityTime: 2000 });
    router.back();
  }

  return (
    <TelaTeclado style={styles.container}>
      <TopoVoltar titulo="Padrões de turno" />

      <View style={styles.card}>
        <View style={styles.campo}>
          <CampoTexto
            label="Nome do turno"
            value={nomeTurno}
            onChangeText={(t) => {
              setNomeTurno(t);
              if (erros.nomeTurno) setErros((ant) => ({ ...ant, nomeTurno: '' }));
            }}
            obrigatorio
            erro={erros.nomeTurno}
          />
        </View>
        <View style={styles.campo}>
          <CampoTexto
            label="Localização padrão"
            value={localizacaoPadrao}
            onChangeText={(t) => {
              setLocalizacaoPadrao(t);
              if (erros.localizacaoPadrao) setErros((ant) => ({ ...ant, localizacaoPadrao: '' }));
            }}
            placeholder="Ex: CCO"
            obrigatorio
            erro={erros.localizacaoPadrao}
          />
        </View>
        <View style={[styles.linha, styles.campo]}>
          <View style={styles.coluna}>
            <CampoDataHora
              label="Início padrão"
              modo="hora"
              valor={horaInicio}
              onChange={(d) => {
                setHoraInicio(d);
                if (erros.horaInicio) setErros((ant) => ({ ...ant, horaInicio: '' }));
              }}
              obrigatorio
              erro={erros.horaInicio}
            />
          </View>
          <View style={styles.coluna}>
            <CampoDataHora
              label="Fim padrão"
              modo="hora"
              valor={horaFim}
              onChange={(d) => {
                setHoraFim(d);
                if (erros.horaFim) setErros((ant) => ({ ...ant, horaFim: '' }));
              }}
              obrigatorio
              erro={erros.horaFim}
            />
          </View>
        </View>

        <Pressable style={styles.botao} onPress={salvar}>
          <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
            Salvar
          </ThemedText>
        </Pressable>
      </View>
    </TelaTeclado>
  );
}

function parseHora(hhmm: string) {
  const [hh, mm] = hhmm.split(':').map((x) => Number(x));
  const d = new Date();
  d.setHours(hh || 0, mm || 0, 0, 0);
  return d;
}

function formatarHora(d: Date) {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
  },
  campo: {
    marginBottom: 20,
  },
  linha: { flexDirection: 'row', gap: 12 },
  coluna: { flex: 1 },
  botao: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff' },
});


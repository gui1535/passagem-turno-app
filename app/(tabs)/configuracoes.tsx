import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { CampoDataHora } from '@/components/campo-data-hora';
import { CampoTexto } from '@/components/campo-texto';
import { SelectEmpresa } from '@/components/select-empresa';
import { TelaTeclado } from '@/components/tela-teclado';
import { ThemedText } from '@/components/themed-text';
import { Empresa } from '@/src/domain/enums';
import type { ConfiguracaoApp, PessoaPadrao } from '@/src/domain/types';
import {
  adicionarPessoaPadrao,
  listarPessoasPadrao,
  pegarConfiguracaoApp,
  removerPessoaPadrao,
  salvarConfiguracaoApp,
} from '@/src/data/repositories';

export default function ConfiguracoesTab() {
  const [nomeTurno, setNomeTurno] = useState('');
  const [localizacaoPadrao, setLocalizacaoPadrao] = useState('');
  const [horaInicio, setHoraInicio] = useState<Date | null>(null);
  const [horaFim, setHoraFim] = useState<Date | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});

  const [pessoaNome, setPessoaNome] = useState('');
  const [pessoaEmpresa, setPessoaEmpresa] = useState<Empresa>(Empresa.CPTM);
  const [pessoaEmpresaOutros, setPessoaEmpresaOutros] = useState('');
  const [errosPessoa, setErrosPessoa] = useState<Record<string, string>>({});
  const [pessoas, setPessoas] = useState<PessoaPadrao[]>([]);

  const carregar = useCallback(() => {
    void (async () => {
      const cfg = await pegarConfiguracaoApp();
      if (cfg) {
        setNomeTurno(cfg.nomeTurno);
        setLocalizacaoPadrao(cfg.localizacaoPadrao);
        setHoraInicio(cfg.horaInicioPadrao ? parseHora(cfg.horaInicioPadrao) : null);
        setHoraFim(cfg.horaFimPadrao ? parseHora(cfg.horaFimPadrao) : null);
      }
      const lista = await listarPessoasPadrao();
      setPessoas(lista);
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
      nomeTurno: nomeTurno.trim() || 'Passagem de Turno',
      localizacaoPadrao: localizacaoPadrao.trim() || 'CCO',
      horaInicioPadrao: horaInicio ? formatarHora(horaInicio) : undefined,
      horaFimPadrao: horaFim ? formatarHora(horaFim) : undefined,
    };
    await salvarConfiguracaoApp(cfg);
    carregar();
    Toast.show({ type: 'success', text1: 'Informações salvas com sucesso' });
  }

  async function adicionarPessoa() {
    const e: Record<string, string> = {};
    if (!pessoaNome.trim()) e.nome = 'Obrigatório';
    if (pessoaEmpresa === Empresa.Outros && !pessoaEmpresaOutros.trim()) e.empresaOutros = 'Obrigatório';
    setErrosPessoa(e);
    if (Object.keys(e).length) return;

    await adicionarPessoaPadrao({
      nome: pessoaNome.trim(),
      empresa: pessoaEmpresa === Empresa.Outros ? Empresa.Outros : pessoaEmpresa,
      empresaOutra: pessoaEmpresa === Empresa.Outros ? pessoaEmpresaOutros.trim() : undefined,
    });
    setPessoaNome('');
    setPessoaEmpresa(Empresa.CPTM);
    setPessoaEmpresaOutros('');
    setErrosPessoa({});
    carregar();
  }

  async function excluirPessoa(id: string) {
    await removerPessoaPadrao(id);
    carregar();
  }

  return (
    <TelaTeclado style={styles.container}>
      <ThemedText type="title">Configurações</ThemedText>

      <View style={styles.card}>
        <ThemedText type="defaultSemiBold">Padrões do turno</ThemedText>
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
        <View style={styles.linha}>
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
            Salvar configurações
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.card}>
        <ThemedText type="defaultSemiBold">Pessoas do turno (padrão)</ThemedText>
        <CampoTexto
          label="Nome"
          value={pessoaNome}
          onChangeText={(t) => {
            setPessoaNome(t);
            if (errosPessoa.nome) setErrosPessoa((ant) => ({ ...ant, nome: '' }));
          }}
          obrigatorio
          erro={errosPessoa.nome}
        />
        <SelectEmpresa label="Empresa" value={pessoaEmpresa} onChange={setPessoaEmpresa} obrigatorio />
        {pessoaEmpresa === Empresa.Outros ? (
          <CampoTexto
            label="Qual empresa?"
            value={pessoaEmpresaOutros}
            onChangeText={(t) => {
              setPessoaEmpresaOutros(t);
              if (errosPessoa.empresaOutros) setErrosPessoa((ant) => ({ ...ant, empresaOutros: '' }));
            }}
            placeholder="Digite a empresa"
            obrigatorio
            erro={errosPessoa.empresaOutros}
          />
        ) : null}
        <Pressable style={styles.botao} onPress={adicionarPessoa}>
          <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
            Adicionar pessoa
          </ThemedText>
        </Pressable>

        <View style={styles.lista}>
          {pessoas.length === 0 ? (
            <ThemedText>Nenhuma pessoa cadastrada.</ThemedText>
          ) : (
            pessoas.map((p) => (
              <View key={p.id} style={styles.item}>
                <View style={{ flex: 1 }}>
                  <ThemedText type="defaultSemiBold">{p.nome}</ThemedText>
                  <ThemedText>
                    {p.empresa}
                    {p.empresaOutra ? ` (${p.empresaOutra})` : ''}
                  </ThemedText>
                </View>
                <Pressable onPress={() => excluirPessoa(p.id)} style={styles.botaoExcluir}>
                  <ThemedText>Excluir</ThemedText>
                </Pressable>
              </View>
            ))
          )}
        </View>
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
  container: { flex: 1, padding: 16, gap: 12 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
    gap: 10,
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
  lista: { gap: 10, marginTop: 4 },
  item: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
  },
  botaoExcluir: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
  },
});


import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';

import { CampoTexto } from '@/components/campo-texto';
import { SelectEmpresa } from '@/components/select-empresa';
import { TelaTeclado } from '@/components/tela-teclado';
import { ThemedText } from '@/components/themed-text';
import { TopoVoltar } from '@/components/topo-voltar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  criarResponsavel,
  listarPessoasPadrao,
  listarResponsaveis,
  removerResponsavel,
} from '@/src/data/repositories';
import { Empresa } from '@/src/domain/enums';
import type { PessoaPadrao, Responsavel } from '@/src/domain/types';

function mesmoResponsavel(a: Pick<Responsavel, 'nome' | 'empresa' | 'empresaOutra'>, b: Pick<Responsavel, 'nome' | 'empresa' | 'empresaOutra'>) {
  return a.nome === b.nome && a.empresa === b.empresa && (a.empresaOutra ?? '') === (b.empresaOutra ?? '');
}

export default function ResponsaveisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const turnoId = String(id);
  const tema = useColorScheme() ?? 'light';
  const corTint = useThemeColor({}, 'tint');
  const corIcone = tema === 'light' ? Colors.light.icon : Colors.dark.icon;
  const corCheck = '#0a7ea4';

  const [pessoasPadrao, setPessoasPadrao] = useState<PessoaPadrao[]>([]);
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [adicionarExpandido, setAdicionarExpandido] = useState(false);

  const [nomeExtra, setNomeExtra] = useState('');
  const [empresaExtra, setEmpresaExtra] = useState<Empresa>(Empresa.Trivia);
  const [empresaOutrosExtra, setEmpresaOutrosExtra] = useState('');
  const [errosExtra, setErrosExtra] = useState<Record<string, string>>({});

  const carregar = useCallback(() => {
    void (async () => {
      const [pessoas, lista] = await Promise.all([listarPessoasPadrao(), listarResponsaveis(turnoId)]);
      setPessoasPadrao(pessoas);
      setResponsaveis(lista);
    })();
  }, [turnoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const responsaveisExtras = useMemo(
    () => responsaveis.filter((r) => !pessoasPadrao.some((p) => mesmoResponsavel(p, r))),
    [responsaveis, pessoasPadrao]
  );

  function responsavelDaPessoa(pessoa: PessoaPadrao) {
    return responsaveis.find((r) => mesmoResponsavel(pessoa, r));
  }

  function estaNaEscala(pessoa: PessoaPadrao) {
    return !!responsavelDaPessoa(pessoa);
  }

  async function alternarPessoa(pessoa: PessoaPadrao) {
    const existente = responsavelDaPessoa(pessoa);
    if (existente) {
      await removerResponsavel(existente.id);
    } else {
      await criarResponsavel({
        turnoId,
        nome: pessoa.nome,
        empresa: pessoa.empresa,
        empresaOutra: pessoa.empresaOutra,
      });
    }
    carregar();
  }

  async function adicionarExtra() {
    const e: Record<string, string> = {};
    if (!nomeExtra.trim()) e.nome = 'Obrigatório';
    if (empresaExtra === Empresa.Outros && !empresaOutrosExtra.trim()) e.empresaOutros = 'Obrigatório';
    setErrosExtra(e);
    if (Object.keys(e).length) return;

    const jaExiste = responsaveis.some((r) =>
      mesmoResponsavel(
        {
          nome: nomeExtra.trim(),
          empresa: empresaExtra,
          empresaOutra: empresaExtra === Empresa.Outros ? empresaOutrosExtra.trim() : undefined,
        },
        r
      )
    );
    if (jaExiste) {
      setErrosExtra({ nome: 'Já está na escala' });
      return;
    }

    await criarResponsavel({
      turnoId,
      nome: nomeExtra.trim(),
      empresa: empresaExtra,
      empresaOutra: empresaExtra === Empresa.Outros ? empresaOutrosExtra.trim() : undefined,
    });

    Keyboard.dismiss();
    setNomeExtra('');
    setEmpresaExtra(Empresa.Trivia);
    setEmpresaOutrosExtra('');
    setErrosExtra({});
    setAdicionarExpandido(false);
    carregar();
  }

  async function removerExtra(idResponsavel: string) {
    await removerResponsavel(idResponsavel);
    carregar();
  }

  return (
    <TelaTeclado style={styles.container}>
      <TopoVoltar titulo="Responsáveis" />

      <View style={styles.card}>
        <ThemedText type="defaultSemiBold" style={styles.tituloSecao}>
          Pessoas cadastradas
        </ThemedText>
        <ThemedText style={styles.descricao}>
          Marque quem está na sua escala neste turno.
        </ThemedText>

        {pessoasPadrao.length === 0 ? (
          <ThemedText>
            Nenhuma pessoa cadastrada. Configure em Configurações → Pessoas do turno.
          </ThemedText>
        ) : (
          pessoasPadrao.map((p) => {
            const selecionado = estaNaEscala(p);
            return (
              <Pressable
                key={p.id}
                style={[styles.itemSelecao, selecionado && { borderColor: corTint }]}
                onPress={() => alternarPessoa(p)}>
                <View
                  style={[
                    styles.checkbox,
                    selecionado && [styles.checkboxSelecionado, { borderColor: corCheck }],
                  ]}>
                  {selecionado ? <IconSymbol name="checkmark" size={18} color={corCheck} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="defaultSemiBold">{p.nome}</ThemedText>
                  <ThemedText>
                    {p.empresa}
                    {p.empresaOutra ? ` (${p.empresaOutra})` : ''}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })
        )}
      </View>

      {responsaveisExtras.length > 0 ? (
        <View style={styles.card}>
          <ThemedText type="defaultSemiBold" style={styles.tituloSecao}>
            Outros na escala
          </ThemedText>
          {responsaveisExtras.map((r) => (
            <View key={r.id} style={styles.item}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{r.nome}</ThemedText>
                <ThemedText>
                  {r.empresa}
                  {r.empresaOutra ? ` (${r.empresaOutra})` : ''}
                </ThemedText>
              </View>
              <Pressable onPress={() => removerExtra(r.id)} style={styles.botaoExcluir}>
                <ThemedText>Remover</ThemedText>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.card}>
        <Pressable
          style={styles.cabecalhoExpansivel}
          onPress={() => setAdicionarExpandido((v) => !v)}>
          <IconSymbol
            name="chevron.right"
            size={18}
            color={corIcone}
            style={{ transform: [{ rotate: adicionarExpandido ? '90deg' : '0deg' }] }}
          />
          <View style={styles.cabecalhoTexto}>
            <ThemedText type="defaultSemiBold">Adicionar Responsável</ThemedText>
            {!adicionarExpandido ? (
              <ThemedText style={styles.descricaoRecolhida}>
                Toque para incluir um responsável
              </ThemedText>
            ) : null}
          </View>
        </Pressable>

        {adicionarExpandido ? (
          <View style={styles.conteudoExpansivel}>
            <View style={styles.campo}>
              <CampoTexto
                label="Nome"
                value={nomeExtra}
                onChangeText={(t) => {
                  setNomeExtra(t);
                  if (errosExtra.nome) setErrosExtra((ant) => ({ ...ant, nome: '' }));
                }}
                placeholder="Nome"
                obrigatorio
                erro={errosExtra.nome}
              />
            </View>
            <View style={styles.campo}>
              <SelectEmpresa label="Empresa" value={empresaExtra} onChange={setEmpresaExtra} obrigatorio />
            </View>
            {empresaExtra === Empresa.Outros ? (
              <View style={styles.campo}>
                <CampoTexto
                  label="Qual empresa?"
                  value={empresaOutrosExtra}
                  onChangeText={(t) => {
                    setEmpresaOutrosExtra(t);
                    if (errosExtra.empresaOutros) setErrosExtra((ant) => ({ ...ant, empresaOutros: '' }));
                  }}
                  placeholder="Digite a empresa"
                  obrigatorio
                  erro={errosExtra.empresaOutros}
                />
              </View>
            ) : null}

            <Pressable style={styles.botao} onPress={adicionarExtra}>
              <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
                Adicionar à escala
              </ThemedText>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.resumo}>
        <ThemedText type="defaultSemiBold">
          Na escala: {responsaveis.length} {responsaveis.length === 1 ? 'pessoa' : 'pessoas'}
        </ThemedText>
      </View>
    </TelaTeclado>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  campo: {
    marginBottom: 20,
  },
  tituloSecao: {
    marginBottom: 8,
  },
  descricao: {
    opacity: 0.75,
    marginBottom: 12,
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
  itemSelecao: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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
  item: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  botao: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff' },
  botaoExcluir: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
  },
  resumo: {
    marginBottom: 20,
  },
});

import { useCallback, useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, View } from 'react-native';

import { CampoTexto } from '@/components/campo-texto';
import { SelectEmpresa } from '@/components/select-empresa';
import { TopoVoltar } from '@/components/topo-voltar';
import { TelaTeclado } from '@/components/tela-teclado';
import { ThemedText } from '@/components/themed-text';
import { Empresa } from '@/src/domain/enums';
import type { PessoaPadrao } from '@/src/domain/types';
import { adicionarPessoaPadrao, listarPessoasPadrao, removerPessoaPadrao } from '@/src/data/repositories';

export default function ConfigPessoasTurnoScreen() {
  const [pessoaNome, setPessoaNome] = useState('');
  const [pessoaEmpresa, setPessoaEmpresa] = useState<Empresa>(Empresa.Trivia);
  const [pessoaEmpresaOutros, setPessoaEmpresaOutros] = useState('');
  const [errosPessoa, setErrosPessoa] = useState<Record<string, string>>({});
  const [pessoas, setPessoas] = useState<PessoaPadrao[]>([]);

  const carregar = useCallback(() => {
    void (async () => {
      setPessoas(await listarPessoasPadrao());
    })();
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function adicionar() {
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

    Keyboard.dismiss();
    setPessoaNome('');
    setPessoaEmpresa(Empresa.Trivia);
    setPessoaEmpresaOutros('');
    setErrosPessoa({});
    carregar();
  }

  async function excluir(id: string) {
    await removerPessoaPadrao(id);
    carregar();
  }

  return (
    <TelaTeclado style={styles.container}>
      <TopoVoltar titulo="Pessoas do turno" />

      <View style={[styles.card, { marginTop: 20 }]}>
        <View style={styles.campo}>
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
        </View>
        <View style={styles.campo}>
          <SelectEmpresa label="Empresa" value={pessoaEmpresa} onChange={setPessoaEmpresa} obrigatorio />
        </View>
        {pessoaEmpresa === Empresa.Outros ? (
          <View style={styles.campo}>
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
          </View>
        ) : null}

        <Pressable style={styles.botao} onPress={adicionar}>
          <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
            Adicionar pessoa
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.card}>
        <ThemedText type="defaultSemiBold" style={styles.tituloLista}>Lista</ThemedText>
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
              <Pressable onPress={() => excluir(p.id)} style={styles.botaoExcluir}>
                <ThemedText>Excluir</ThemedText>
              </Pressable>
            </View>
          ))
        )}
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
  botao: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: { color: '#fff' },
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
  botaoExcluir: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
  },
  tituloLista: {
    marginBottom: 12,
  },
});
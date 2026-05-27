import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { CampoDataHora } from '@/components/campo-data-hora';
import { Tela } from '@/components/tela';
import { ThemedText } from '@/components/themed-text';
import { criarTurno } from '@/src/data/repositories';
import { TipoAtividade } from '@/src/domain/enums';

export default function NovoTurnoScreen() {
  const [data, setData] = useState<Date | null>(new Date());
  const [horaInicio, setHoraInicio] = useState<Date | null>(null);
  const [horaFim, setHoraFim] = useState<Date | null>(null);
  const [localizacao, setLocalizacao] = useState('');
  const [descricao, setDescricao] = useState('');

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
      tipoAtividade: TipoAtividade.Corretiva,
    });
    router.replace(`/turno/${turno.id}`);
  }

  return (
    <Tela style={styles.container}>
      <ThemedText type="title">Novo turno</ThemedText>

      <CampoDataHora label="Data" modo="data" valor={data} onChange={setData} />
      <View style={styles.linha}>
        <View style={styles.coluna}>
          <CampoDataHora label="Início" modo="hora" valor={horaInicio} onChange={setHoraInicio} />
        </View>
        <View style={styles.coluna}>
          <CampoDataHora label="Fim" modo="hora" valor={horaFim} onChange={setHoraFim} />
        </View>
      </View>
      <Campo label="Localização" value={localizacao} onChangeText={setLocalizacao} placeholder="Ex: CCO" />
      <Campo
        label="Descrição do dia"
        value={descricao}
        onChangeText={setDescricao}
        placeholder="O que aconteceu no turno"
        multiline
      />

      <Pressable style={styles.botao} onPress={salvar}>
        <ThemedText type="defaultSemiBold" style={styles.botaoTexto}>
          Salvar e continuar
        </ThemedText>
      </Pressable>
    </Tela>
  );
}

function Campo(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.campo}>
      <ThemedText type="defaultSemiBold">{props.label}</ThemedText>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#687076"
        style={[styles.input, props.multiline ? styles.inputMultiline : null]}
        multiline={props.multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  linha: {
    flexDirection: 'row',
    gap: 12,
  },
  coluna: {
    flex: 1,
  },
  campo: {
    gap: 6,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111',
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  botao: {
    marginTop: 8,
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
  },
});


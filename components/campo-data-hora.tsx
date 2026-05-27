import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type Props = {
  label: string;
  modo: 'data' | 'hora';
  valor: Date | null;
  onChange: (v: Date | null) => void;
};

export function CampoDataHora({ label, modo, valor, onChange }: Props) {
  const [aberto, setAberto] = useState(false);

  const texto = useMemo(() => {
    if (!valor) return modo === 'data' ? 'Selecionar' : 'Selecionar';
    if (modo === 'data') return valor.toLocaleDateString('pt-BR');
    return valor.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }, [modo, valor]);

  function abrir() {
    setAberto(true);
  }

  function fechar() {
    setAberto(false);
  }

  function aoMudar(evento: DateTimePickerEvent, dataSelecionada?: Date) {
    if (Platform.OS === 'android') {
      setAberto(false);
      if (evento.type === 'set' && dataSelecionada) onChange(dataSelecionada);
      return;
    }
    if (dataSelecionada) onChange(dataSelecionada);
  }

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>

      <Pressable style={styles.botaoCampo} onPress={abrir}>
        <ThemedText>{texto}</ThemedText>
      </Pressable>

      {Platform.OS === 'android' && aberto ? (
        <DateTimePicker
          value={valor ?? new Date()}
          mode={modo === 'data' ? 'date' : 'time'}
          onChange={aoMudar}
          is24Hour
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={aberto} animationType="slide" transparent onRequestClose={fechar}>
          <View style={styles.fundoModal}>
            <View style={styles.caixaModal}>
              <View style={styles.topoModal}>
                <Pressable onPress={() => onChange(null)}>
                  <ThemedText>Limpar</ThemedText>
                </Pressable>
                <Pressable onPress={fechar}>
                  <ThemedText type="defaultSemiBold">OK</ThemedText>
                </Pressable>
              </View>
              <DateTimePicker
                value={valor ?? new Date()}
                mode={modo === 'data' ? 'date' : 'time'}
                onChange={aoMudar}
                is24Hour
                display="spinner"
              />
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  botaoCampo: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fundoModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  caixaModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 12,
  },
  topoModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
});


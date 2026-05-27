import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  obrigatorio?: boolean;
  erro?: string | null;
};

export function CampoTexto({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  obrigatorio,
  erro,
}: Props) {
  const tema = useColorScheme() ?? 'light';
  const corTexto = tema === 'dark' ? '#fff' : '#111';
  const temErro = !!erro;

  return (
    <View style={styles.campo}>
      <ThemedText type="defaultSemiBold">
        {label}
        {obrigatorio ? ' *' : ''}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#687076"
        style={[
          styles.input,
          { color: corTexto },
          temErro ? styles.inputErro : null,
          multiline ? styles.multiline : null,
        ]}
        multiline={multiline}
      />
      {temErro ? <ThemedText style={styles.textoErro}>{erro}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: { gap: 6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputErro: {
    borderColor: '#d32f2f',
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  textoErro: {
    color: '#d32f2f',
    fontSize: 12,
  },
});


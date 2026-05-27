import { Picker } from '@react-native-picker/picker';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type OpcaoSelect<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  label: string;
  value: T;
  opcoes: OpcaoSelect<T>[];
  onChange: (v: T) => void;
  obrigatorio?: boolean;
  erro?: string | null;
};

export function SelectOpcao<T extends string>({ label, value, opcoes, onChange, obrigatorio, erro }: Props<T>) {
  const tema = useColorScheme() ?? 'light';
  const cor = tema === 'dark' ? '#fff' : '#111';
  const temErro = !!erro;

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold">
        {label}
        {obrigatorio ? ' *' : ''}
      </ThemedText>
      <View style={[styles.caixa, temErro ? styles.caixaErro : null]}>
        <Picker
          selectedValue={value}
          onValueChange={(v) => onChange(v as T)}
          dropdownIconColor={cor}
          style={{ color: cor }}>
          {opcoes.map((o) => (
            <Picker.Item key={o.value} label={o.label} value={o.value} />
          ))}
        </Picker>
      </View>
      {temErro ? <ThemedText style={styles.textoErro}>{erro}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  caixa: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 10,
    overflow: 'hidden',
  },
  caixaErro: {
    borderColor: '#d32f2f',
  },
  textoErro: {
    color: '#d32f2f',
    fontSize: 12,
  },
});

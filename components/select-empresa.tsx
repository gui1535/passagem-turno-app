import { Picker } from '@react-native-picker/picker';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Empresa } from '@/src/domain/enums';

const COR_TEXTO_INPUT = '#111';

type Props = {
  label: string;
  value: Empresa;
  onChange: (v: Empresa) => void;
  obrigatorio?: boolean;
  erro?: string | null;
};

export function SelectEmpresa({ label, value, onChange, obrigatorio, erro }: Props) {
  const cor = COR_TEXTO_INPUT;
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
          onValueChange={(v) => onChange(v as Empresa)}
          dropdownIconColor={cor}
          style={{ color: cor }}>
          <Picker.Item label="CPTM" value={Empresa.CPTM} />
          <Picker.Item label="Trivia" value={Empresa.Trivia} />
          <Picker.Item label="Alstom" value={Empresa.Alstom} />
          <Picker.Item label="Siemens" value={Empresa.Siemens} />
          <Picker.Item label="Outros" value={Empresa.Outros} />
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


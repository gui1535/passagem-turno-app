import { Image } from 'expo-image';
import { StyleSheet, View, type ViewStyle } from 'react-native';

const PROPORCAO = 576 / 154;
const LOGO = require('@/assets/images/logotipo-azul.png');

type Props = {
  /** Altura do logo em pixels (largura calculada pela proporção 576:154) */
  altura?: number;
  alinhamento?: 'left' | 'center';
  style?: ViewStyle;
};

export function Logotipo({ altura = 40, alinhamento = 'center', style }: Props) {
  const largura = altura * PROPORCAO;

  return (
    <View
      style={[
        styles.container,
        alinhamento === 'left' ? styles.esquerda : styles.centro,
        style,
      ]}>
      <Image
        source={LOGO}
        style={{ width: largura, height: altura }}
        contentFit="contain"
        accessibilityLabel="Logotipo Trivia"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
  },
  centro: {
    alignSelf: 'center',
  },
  esquerda: {
    alignSelf: 'flex-start',
  },
});

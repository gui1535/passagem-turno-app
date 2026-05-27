import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  titulo: string;
};

export function TopoVoltar({ titulo }: Props) {
  const corIcone = useThemeColor({}, 'text');
  const handleVoltar = () => {
    router.back();
  };
  return (
    <View style={styles.container}>
      <Pressable onPress={handleVoltar} style={styles.botao}>
        <IconSymbol name="chevron.left" size={22} color={corIcone} />
      </Pressable>
      <ThemedText type="subtitle" style={styles.titulo}>
        {titulo}
      </ThemedText>
      <View style={styles.espaco} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botao: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
  },
  titulo: {
    flex: 1,
    textAlign: 'center',
  },
  espaco: {
    width: 70,
  },
});


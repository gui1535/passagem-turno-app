import { router } from 'expo-router';
import type React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  titulo: string;
  acaoDireita?: React.ReactNode;
};

export function TopoVoltar({ titulo, acaoDireita }: Props) {
  const corIcone = useThemeColor({}, 'text');
  const handleVoltar = () => {
    router.back();
  };
  return (
    <View style={styles.container}>
      <Pressable onPress={handleVoltar} style={styles.botao} accessibilityLabel="Voltar">
        <IconSymbol name="chevron.left" size={22} color={corIcone} />
      </Pressable>
      <ThemedText type="subtitle" style={styles.titulo} numberOfLines={1}>
        {titulo}
      </ThemedText>
      <View style={styles.ladoDireito}>{acaoDireita ?? <View style={styles.espaco} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
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
  ladoDireito: {
    width: 44,
    alignItems: 'flex-end',
  },
  espaco: {
    width: 44,
  },
});


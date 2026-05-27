import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type React from 'react';

import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  children: React.ReactNode;
  style?: any;
};

// Safe area + fundo do tema
export function Tela({ children, style }: Props) {
  const backgroundColor = useThemeColor({}, 'background');
  return <SafeAreaView style={[styles.base, { backgroundColor }, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
});


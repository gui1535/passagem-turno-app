import type React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { Tela } from '@/components/tela';

type Props = {
  children: React.ReactNode;
  style?: any;
};

// Tela com ajuste de teclado (bom pra formulários)
export function TelaTeclado({ children, style }: Props) {
  return (
    <Tela style={[styles.base, style]}>
      <KeyboardAvoidingView
        style={styles.base}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.conteudo}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Tela>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1 },
  conteudo: { flexGrow: 1 },
});


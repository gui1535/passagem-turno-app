import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  titulo: string;
  descricao?: string;
  inicioAberto?: boolean;
  children: ReactNode;
};

export function SecaoDropdown({ titulo, descricao, inicioAberto = false, children }: Props) {
  const [aberto, setAberto] = useState(inicioAberto);
  const tema = useColorScheme() ?? 'light';
  const corIcone = tema === 'light' ? Colors.light.icon : Colors.dark.icon;

  return (
    <View style={styles.card}>
      <Pressable style={styles.cabecalho} onPress={() => setAberto((v) => !v)}>
        <IconSymbol
          name="chevron.right"
          size={18}
          color={corIcone}
          style={{ transform: [{ rotate: aberto ? '90deg' : '0deg' }] }}
        />
        <View style={styles.cabecalhoTexto}>
          <ThemedText type="defaultSemiBold">{titulo}</ThemedText>
          {!aberto && descricao ? <ThemedText style={styles.descricaoRecolhida}>{descricao}</ThemedText> : null}
        </View>
      </Pressable>

      {aberto ? (
        <View style={styles.conteudo}>
          {descricao ? <ThemedText style={styles.descricao}>{descricao}</ThemedText> : null}
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cabecalhoTexto: {
    flex: 1,
    gap: 4,
  },
  descricaoRecolhida: {
    opacity: 0.75,
    fontSize: 13,
  },
  descricao: {
    opacity: 0.75,
    fontSize: 13,
    marginBottom: 16,
  },
  conteudo: {
    marginTop: 12,
  },
});

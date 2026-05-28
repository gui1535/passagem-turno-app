import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Tela } from '@/components/tela';
import { ThemedText } from '@/components/themed-text';

export default function ConfiguracoesTab() {
  return (
    <Tela style={styles.container}>
      <ThemedText type="title" style={styles.titulo}>
        Configurações
      </ThemedText>

      <View style={styles.listaMenu}>
        <ItemMenu
          titulo="Padrões de turno"
          onPress={() => router.push('/configuracoes/padroes')}
        />
        <ItemMenu
          titulo="Pessoas do turno"
          onPress={() => router.push('/configuracoes/pessoas')}
        />
      </View>
    </Tela>
  );
}

function ItemMenu(props: { titulo: string; onPress: () => void }) {
  return (
    <Pressable style={styles.itemMenu} onPress={props.onPress}>
      <ThemedText type="defaultSemiBold">{props.titulo}</ThemedText>
      <ThemedText style={styles.mini}>Abrir</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  listaMenu: { gap: 10 },
  itemMenu: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#687076',
    borderRadius: 12,
    padding: 12,
  },
  mini: { opacity: 0.7, marginTop: 2 },
  titulo: {
    marginBottom: 20,
  },
});

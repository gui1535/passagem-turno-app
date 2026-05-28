import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import { AppToast } from '@/components/app-toast';
import { BarrasSistema } from '@/components/barras-sistema';
import { useThemeColor } from '@/hooks/use-theme-color';
import { iniciarBanco } from '@/src/data/database';
import { garantirPastas } from '@/src/data/storage';
import { garantirModelosTextoIniciais } from '@/src/data/seed/modelosTextoSeed';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const backgroundColor = useThemeColor({}, 'background');
  useEffect(() => {
    // Inicia o básico do app offline
    void (async () => {
      await iniciarBanco();
      await garantirPastas();
      await garantirModelosTextoIniciais();
    })();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={"light-content"} backgroundColor={"#1E1D69"} />
      <Stack screenOptions={{ headerShown: false}}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="configuracoes/padroes" options={{ title: 'Padrões de turno', animation: 'fade_from_bottom' }} />
        <Stack.Screen name="configuracoes/pessoas" options={{ title: 'Pessoas do turno', animation: 'fade_from_bottom' }} />
      </Stack>
      <BarrasSistema />
      <AppToast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
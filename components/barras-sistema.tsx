import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar, setStatusBarStyle } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

function aplicarBarrasAndroid() {
  // Ícones escuros (conteúdo "dark") para fundo claro.
  // Em expo-navigation-bar, "light" = barra clara com conteúdo escuro.
  NavigationBar.setStyle('light');
  setStatusBarStyle('dark');
}

/** Ícones das barras do sistema sempre escuros (melhor em fundo claro). */
export function BarrasSistema() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    aplicarBarrasAndroid();
  }, []);

  return <StatusBar style="dark" />;
}

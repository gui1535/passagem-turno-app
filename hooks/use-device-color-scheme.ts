import { useColorScheme as useEsquemaNativo } from 'react-native';

/** Tema do sistema operacional (Android/iOS), independente do tema fixo do app. */
export function useDeviceColorScheme(): 'light' | 'dark' {
  return useEsquemaNativo() === 'dark' ? 'dark' : 'light';
}

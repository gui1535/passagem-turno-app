import { useMemo } from 'react';
import Toast, { BaseToast, type ToastConfig } from 'react-native-toast-message';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function AppToast() {
  const tema = useColorScheme() ?? 'light';
  const cores = Colors[tema];

  const config = useMemo<ToastConfig>(
    () => ({
      success: (props) => (
        <BaseToast
          {...props}
          style={{
            borderLeftColor: cores.tint,
            backgroundColor: tema === 'dark' ? '#1f2326' : '#fff',
            borderWidth: 1,
            borderColor: tema === 'dark' ? '#3a3f44' : '#e0e4e8',
          }}
          contentContainerStyle={{
            paddingHorizontal: 14,
          }}
          text1Style={{
            fontSize: 14,
            fontWeight: '600',
            color: cores.text,
          }}
        />
      ),
      error: (props) => (
        <BaseToast
          {...props}
          style={{
            borderLeftColor: '#d32f2f',
            backgroundColor: tema === 'dark' ? '#1f2326' : '#fff',
            borderWidth: 1,
            borderColor: tema === 'dark' ? '#3a3f44' : '#e0e4e8',
          }}
          contentContainerStyle={{
            paddingHorizontal: 14,
          }}
          text1Style={{
            fontSize: 14,
            fontWeight: '600',
            color: cores.text,
          }}
        />
      ),
    }),
    [tema, cores.text, cores.tint]
  );

  return <Toast config={config} />;
}

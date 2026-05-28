import { useMemo } from 'react';
import Toast, { BaseToast, type ToastConfig } from 'react-native-toast-message';

import { Colors } from '@/constants/theme';

export function AppToast() {
  const cores = Colors.light;

  const config = useMemo<ToastConfig>(
    () => ({
      success: (props) => (
        <BaseToast
          {...props}
          style={{
            borderLeftColor: cores.tint,
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#e0e4e8',
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
            backgroundColor: '#fff',
            borderWidth: 1,
            borderColor: '#e0e4e8',
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
    [cores.text, cores.tint]
  );

  return <Toast config={config} />;
}

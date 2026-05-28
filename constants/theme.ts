/**
 * Paleta de cores do app (somente tema claro).
 */

import { Platform } from 'react-native';

/** Cor de fundo dos botões de ação principal (Salvar, Continuar, etc.) */
export const corBotao = '#1E1D69';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: corBotao,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: corBotao,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

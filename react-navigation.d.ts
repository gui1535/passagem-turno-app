import type { Theme } from '@react-navigation/native';

declare global {
  namespace ReactNavigation {
    type Theme = Theme;
  }
}

export {};


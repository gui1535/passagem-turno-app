import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { color?: string },
  colorName: keyof typeof Colors.light
) {
  if (props.color) {
    return props.color;
  }
  return Colors.light[colorName];
}

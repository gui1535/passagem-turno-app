import type React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Logotipo } from '@/components/logotipo';

type Props = {
  alturaLogo?: number;
  alinhamentoLogo?: 'left' | 'center';
  acaoDireita?: React.ReactNode;
  children?: React.ReactNode;
  style?: ViewStyle;
  /** Oculta a linha divisória inferior */
  semDivisor?: boolean;
  /** Centraliza título e textos abaixo do logo */
  conteudoCentralizado?: boolean;
};

export function CabecalhoLogo({
  alturaLogo = 40,
  alinhamentoLogo = 'left',
  acaoDireita,
  children,
  style,
  semDivisor,
  conteudoCentralizado,
}: Props) {
  const temLinhaSuperior = acaoDireita != null;

  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.linhaLogo, temLinhaSuperior && styles.linhaLogoComAcao]}>
        <View style={styles.logoArea}>
          <Logotipo altura={alturaLogo} alinhamento={alinhamentoLogo} />
        </View>
        {acaoDireita ? <View style={styles.acao}>{acaoDireita}</View> : null}
      </View>
      {children ? (
        <View style={[styles.conteudo, conteudoCentralizado && styles.conteudoCentro]}>{children}</View>
      ) : null}
      {!semDivisor ? <View style={styles.divisor} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 4,
  },
  linhaLogo: {
    marginBottom: 4,
  },
  linhaLogoComAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  logoArea: {
    flex: 1,
    minWidth: 0,
  },
  acao: {
    flexShrink: 0,
  },
  conteudo: {
    marginTop: 8,
    marginBottom: 4,
    gap: 4,
    alignItems: 'stretch',
  },
  conteudoCentro: {
    alignItems: 'center',
  },
  divisor: {
    marginTop: 12,
    marginBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#687076',
    opacity: 0.45,
  },
});

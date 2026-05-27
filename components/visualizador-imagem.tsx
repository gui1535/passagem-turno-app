import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

const MAX_LEGENDA = 40;

type ImagemVisualizada = {
  uri: string;
  legenda?: string;
};

type Props = {
  imagem: ImagemVisualizada | null;
  onFechar: (legenda: string) => void;
};

export function VisualizadorImagem({ imagem, onFechar }: Props) {
  const [legenda, setLegenda] = useState('');

  useEffect(() => {
    setLegenda(imagem?.legenda ?? '');
  }, [imagem?.uri, imagem?.legenda]);

  function fechar() {
    onFechar(legenda.trim());
  }

  return (
    <Modal visible={!!imagem} transparent animationType="fade" onRequestClose={fechar}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.fechar} onPress={fechar}>
          <ThemedText type="defaultSemiBold" style={styles.fecharTexto}>
            Fechar
          </ThemedText>
        </Pressable>
        {imagem ? (
          <>
            <View style={styles.areaImagem}>
              <Image source={{ uri: imagem.uri }} style={styles.imagem} contentFit="contain" />
            </View>
            <View style={styles.legendaArea}>
              <ThemedText type="defaultSemiBold" style={styles.legendaLabel}>
                Descrição
              </ThemedText>
              <TextInput
                value={legenda}
                onChangeText={(texto) => setLegenda(texto.slice(0, MAX_LEGENDA))}
                placeholder="Opcional — até 40 caracteres"
                placeholderTextColor="rgba(255,255,255,0.45)"
                style={styles.legendaInput}
                maxLength={MAX_LEGENDA}
                returnKeyType="done"
                blurOnSubmit
              />
              <ThemedText style={styles.contador}>
                {legenda.length}/{MAX_LEGENDA}
              </ThemedText>
            </View>
          </>
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  fechar: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 2,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  fecharTexto: {
    color: '#fff',
  },
  areaImagem: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 16,
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  legendaArea: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.2)',
    gap: 8,
  },
  legendaLabel: {
    color: '#fff',
  },
  legendaInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
  },
  contador: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    textAlign: 'right',
  },
});

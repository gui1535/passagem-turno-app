import * as ImagePicker from 'expo-image-picker';

import { criarImagemFalha } from '@/src/data/repositories';
import { copiarImagemParaApp } from '@/src/data/storage';
import { criarId } from '@/src/utils/geral';

export type ResultadoImagemFalha = 'ok' | 'cancelado' | 'sem_permissao';

export type ResultadoUploadImagens = {
  status: ResultadoImagemFalha;
  quantidade: number;
};

async function salvarUriNaFalha(falhaId: string, uriOrigem: string) {
  const ext = uriOrigem.toLowerCase().includes('.png') ? 'png' : 'jpg';
  const nome = `${falhaId}-${criarId()}.${ext}`;
  const uri = await copiarImagemParaApp(uriOrigem, nome);
  await criarImagemFalha({ falhaId, uri });
}

export async function capturarFotoParaFalha(falhaId: string): Promise<ResultadoImagemFalha> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return 'sem_permissao';

  const resultado = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.8,
  });

  if (resultado.canceled || !resultado.assets[0]) return 'cancelado';

  await salvarUriNaFalha(falhaId, resultado.assets[0].uri);
  return 'ok';
}

export async function enviarImagensParaFalha(falhaId: string): Promise<ResultadoUploadImagens> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return { status: 'sem_permissao', quantidade: 0 };

  const resultado = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsMultipleSelection: true,
    selectionLimit: 0,
  });

  if (resultado.canceled || resultado.assets.length === 0) {
    return { status: 'cancelado', quantidade: 0 };
  }

  for (const asset of resultado.assets) {
    await salvarUriNaFalha(falhaId, asset.uri);
  }

  return { status: 'ok', quantidade: resultado.assets.length };
}

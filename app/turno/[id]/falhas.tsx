import { Redirect, useLocalSearchParams } from 'expo-router';

/** Rota antiga: atividades ficam na tela principal do turno */
export default function FalhasRedirectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/turno/${String(id)}`} />;
}

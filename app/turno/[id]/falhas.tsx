import { Redirect, useLocalSearchParams } from 'expo-router';

// Falhas passaram a ser listadas na tela principal do turno
export default function FalhasRedirectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/turno/${id}`} />;
}

import { Redirect, useLocalSearchParams } from 'expo-router';

/** Rota antiga: redireciona para /atividade/[atividadeId] */
export default function FalhaRedirectScreen() {
  const { id, falhaId } = useLocalSearchParams<{ id: string; falhaId: string }>();
  return <Redirect href={`/turno/${String(id)}/atividade/${String(falhaId)}`} />;
}

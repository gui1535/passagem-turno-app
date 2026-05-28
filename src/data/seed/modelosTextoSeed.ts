import { contarModelosTexto, inserirModeloTexto } from '@/src/data/repositories/modeloTextoRepositorio';

// Modelos básicos do escopo
export async function garantirModelosTextoIniciais() {
  const total = await contarModelosTexto();
  if (total > 0) return;

  await inserirModeloTexto({
    tituloModelo: 'AMV sem indicação',
    tituloDefeitoPadrao: 'AMV sem indicação',
    descricaoPadrao: 'Sem indicação no AMV. Verificar status do equipamento e conexões.',
    acoesComunsPadrao: 'Inspeção visual, conferência de alimentação e reaperto de conexões.',
  });

  await inserirModeloTexto({
    tituloModelo: 'UR desconectada',
    tituloDefeitoPadrao: 'UR desconectada',
    descricaoPadrao: 'Unidade remota sem comunicação. Verificar rede e integridade do link.',
    acoesComunsPadrao: 'Reinício do equipamento, verificação de cabos e teste de comunicação.',
  });

  await inserirModeloTexto({
    tituloModelo: 'Rádio com transmissão baixa',
    tituloDefeitoPadrao: 'Rádio com transmissão baixa',
    descricaoPadrao: 'Baixa qualidade de transmissão. Verificar antena, conectores e interferência.',
    acoesComunsPadrao: 'Teste de antena, reaperto de conectores e avaliação de sinal.',
  });

  await inserirModeloTexto({
    tituloModelo: 'Servidor com problema',
    tituloDefeitoPadrao: 'Servidor com problema',
    descricaoPadrao: 'Servidor apresentou instabilidade. Verificar logs e serviços.',
    acoesComunsPadrao: 'Checagem de serviços, reinício controlado e análise de logs.',
  });

  await inserirModeloTexto({
    tituloModelo: 'Sinal apagado',
    tituloDefeitoPadrao: 'Sinal apagado',
    descricaoPadrao: 'Sinal/indicação apagada. Verificar alimentação, módulo e cabos.',
    acoesComunsPadrao: 'Medição de tensão, inspeção de cabos e teste de módulo.',
  });

  await inserirModeloTexto({
    tituloModelo: 'Acompanhamento de fornecedor',
    tituloDefeitoPadrao: 'Acompanhamento de fornecedor',
    descricaoPadrao: 'Atividade em acompanhamento com fornecedor durante o turno.',
    acoesComunsPadrao: 'Registrar contatos, horários e próximos passos combinados.',
  });
}


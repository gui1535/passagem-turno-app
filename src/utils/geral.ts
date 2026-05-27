// Coisas simples do app (id e datas)

export function agoraIso() {
  return new Date().toISOString();
}

export function criarId() {
  // Bom o bastante pra uso local/offline
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}


// src/services/sessao.service.ts
// Gerenciamento de sessão em memória (substitua por Redis em produção)

interface MensagemHistorico {
  role: 'user' | 'model';
  content: string;
}

const sessoes = new Map<string, MensagemHistorico[]>();
const MAX_HISTORICO = 20; // últimas 20 trocas por usuário

export function obterHistorico(telefone: string): MensagemHistorico[] {
  return sessoes.get(telefone) || [];
}

export function adicionarAoHistorico(
  telefone: string,
  role: 'user' | 'model',
  content: string
): void {
  const historico = sessoes.get(telefone) || [];
  historico.push({ role, content });

  // Mantém apenas as últimas MAX_HISTORICO mensagens
  if (historico.length > MAX_HISTORICO) {
    historico.splice(0, historico.length - MAX_HISTORICO);
  }

  sessoes.set(telefone, historico);
}

export function limparSessao(telefone: string): void {
  sessoes.delete(telefone);
}

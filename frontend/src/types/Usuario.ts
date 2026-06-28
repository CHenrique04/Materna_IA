// frontend/src/types/Usuario.ts

export interface Usuario {
  id: number;
  telegramId?: string | null;
  nome: string;
  telefone: string;
  dataNascimento?: string | null;
  dataUltimaMenstruacao?: string | null;
  semanasGestacao?: number | null;
  nomeEmergencia?: string | null;
  numeroEmergencia?: string | null;
  historicoSaude?: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Relacionamentos para quando buscarmos o usuário completo
  mensagens?: Mensagem[];
  exames?: Exame[];
  consultas?: Consulta[];
  topicos?: TopicoConsulta[];
}

export interface Mensagem {
  id: number;
  texto: string;
  direcao: 'entrada' | 'saida';
  sentimento?: string | null;
  createdAt: string;
  usuarioId: number;
}

export interface Exame {
  id: number;
  tipo: string;
  dataExame: string;
  resultado?: string | null;
  arquivoUrl?: string | null;
}

export interface TopicoConsulta {
  id: number;
  textoResumo: string;
  status: string;
  createdAt: string;
}

export interface Consulta {
  id: number;
  dataHora: string;
  local: string;
  status: string;
}
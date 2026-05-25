// frontend/src/types/Usuario.ts
export interface Usuario {
  id: number;
  nome: string;
  telefone: string;
  dataNascimento?: string | null;
  dataUltimaMenstruacao?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Mensagem {
  id: number;
  texto: string;
  direcao: 'entrada' | 'saida';
  createdAt: string;
  usuarioId: number;
}
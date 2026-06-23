export interface CreateUsuarioDTO {
  telegramId?: string; // Adicionado
  nome: string;
  telefone: string;
  dataNascimento?: string | null;
  dataUltimaMenstruacao?: string | null;
}

export interface UpdateUsuarioDTO {
  telegramId?: string; // Adicionado
  nome?: string;
  telefone?: string;
  dataNascimento?: string | null;
  dataUltimaMenstruacao?: string | null;
}

export interface UsuarioResponse {
  id: number;
  telegramId: string | null;
  nome: string;
  telefone: string;
  dataNascimento: string | null;
  dataUltimaMenstruacao: string | null;
  createdAt: Date;
  updatedAt: Date;
}
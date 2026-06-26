export interface CreateUsuarioDTO {
  telegramId?: string;
  nome: string;
  telefone: string;
  dataNascimento?: string | null;
  semanasGestacao?: number | null;
  nomeEmergencia?: string | null; // Adicionado
  numeroEmergencia?: string | null;
  historicoSaude?: string | null;
}

export interface UpdateUsuarioDTO {
  telegramId?: string;
  nome?: string;
  telefone?: string;
  dataNascimento?: string | null;
  semanasGestacao?: number | null;
  nomeEmergencia?: string | null; // Adicionado
  numeroEmergencia?: string | null;
  historicoSaude?: string | null;
}

export interface UsuarioResponse {
  id: number;
  telegramId: string | null;
  nome: string;
  telefone: string;
  dataNascimento: string | null;
  semanasGestacao: number | null;
  nomeEmergencia: string | null; // Adicionado
  numeroEmergencia: string | null;
  historicoSaude: string | null;
  createdAt: Date;
  updatedAt: Date;
}
// src/resources/usuarios/usuarios.types.ts
export interface CreateUsuarioDTO {
  nome: string;
  telefone: string;
  dataNascimento?: string | null;
  dataUltimaMenstruacao?: string | null;
}

export interface UpdateUsuarioDTO {
  nome?: string;
  telefone?: string;
  dataNascimento?: string | null;
  dataUltimaMenstruacao?: string | null;
}

export interface UsuarioResponse {
  id: number;
  nome: string;
  telefone: string;
  dataNascimento: string | null;
  dataUltimaMenstruacao: string | null;
  createdAt: Date;
  updatedAt: Date;
}
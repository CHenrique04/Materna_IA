export interface Administrador {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  municipio: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateAdministradorDTO = {
  nome: string;
  email: string;
  cargo: string;
  municipio: string;
  senha: string; // senha em texto vindo do frontend
};

export type UpdateAdministradorDTO = Partial<CreateAdministradorDTO>;
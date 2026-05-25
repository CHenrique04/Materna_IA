import api from './api';
import { Administrador } from '../types/Administrador';

type CreateAdminDTO = {
  nome: string;
  email: string;
  cargo: string;
  municipio: string;
  senha: string;
};

type UpdateAdminDTO = Partial<CreateAdminDTO>;

export const listarAdministradores = async (): Promise<Administrador[]> => {
  const res = await api.get('/administradores');
  return res.data;
};

export const buscarAdministrador = async (id: number): Promise<Administrador> => {
  const res = await api.get(`/administradores/${id}`);
  return res.data;
};

export const criarAdministrador = async (data: CreateAdminDTO): Promise<Administrador> => {
  const res = await api.post('/administradores', data);
  return res.data;
};

export const atualizarAdministrador = async (id: number, data: UpdateAdminDTO): Promise<Administrador> => {
  const res = await api.put(`/administradores/${id}`, data);
  return res.data;
};

export const deletarAdministrador = async (id: number): Promise<void> => {
  await api.delete(`/administradores/${id}`);
};
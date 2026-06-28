// frontend/src/services/usuarios.api.ts
import api from './api';
import type { Usuario, Mensagem } from '../types/Usuario';

// --- ROTAS BÁSICAS ---
export const listarUsuarios = async (): Promise<Usuario[]> => {
  const response = await api.get('/usuarios');
  return response.data;
};

export const buscarUsuario = async (id: number): Promise<Usuario> => {
  const response = await api.get(`/usuarios/${id}`);
  return response.data;
};

export const criarUsuario = async (dados: Partial<Usuario>): Promise<Usuario> => {
  const response = await api.post('/usuarios', dados);
  return response.data;
};

export const atualizarUsuario = async (id: number, dados: Partial<Usuario>): Promise<Usuario> => {
  const response = await api.put(`/usuarios/${id}`, dados);
  return response.data;
};

export const deletarUsuario = async (id: number): Promise<void> => {
  await api.delete(`/usuarios/${id}`);
};

export const listarMensagens = async (usuarioId: number): Promise<Mensagem[]> => {
  const response = await api.get(`/usuarios/${usuarioId}/mensagens`);
  return response.data;
};

// --- NOVAS ROTAS (SISTEMA DE ALERTA) ---
export const listarAlertasPendentes = async (): Promise<any[]> => {
  const response = await api.get('/usuarios/alertas/pendentes');
  return response.data;
};

export const resolverAlerta = async (id: number): Promise<any> => {
  const response = await api.put(`/usuarios/alertas/${id}/resolver`);
  return response.data;
};
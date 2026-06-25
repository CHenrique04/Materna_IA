import api from './api';

export const listarMensagensDoUsuario = async (usuarioId: number) => {
  const res = await api.get(`/usuarios/${usuarioId}/mensagens`);
  return res.data; // Retorna um array de mensagens
};
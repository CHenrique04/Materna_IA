import api from './api'; 

export const listarTodasConsultas = async () => {
  const res = await api.get('/consultas');
  return res.data;
};

export const criarConsulta = async (data: { dataHora: string; local: string; usuarioId: number }) => {
  const res = await api.post('/consultas', data);
  return res.data;
};
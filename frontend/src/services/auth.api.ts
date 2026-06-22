import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

export const verificarSetup = async () => {
  const res = await api.get('/auth/check-setup');
  return res.data.isSetupComplete;
};

export const realizarSetup = async (dados: any) => {
  const res = await api.post('/auth/setup', dados);
  return res.data;
};

export const fazerLogin = async (email: string, senha: string) => {
  const res = await api.post('/auth/login', { email, senha });
  return res.data; // { token, admin }
};
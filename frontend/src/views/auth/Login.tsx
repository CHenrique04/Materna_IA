import React, { useState } from 'react';
import { fazerLogin } from '../../services/auth.api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dados = await fazerLogin(email, senha);
      sessionStorage.setItem('token', dados.token);
      window.location.href = '/'; 
    } catch (err) {
      setErro('E-mail ou senha inválidos.');
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center h-screen w-full absolute top-0 left-0 z-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🤰 Materna.IA</h1>
          <p className="text-gray-600 mt-1">Painel do Administrador</p>
        </div>
        
        {erro && <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 text-center font-medium">⚠️ {erro}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">E-mail</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
              placeholder="admin@saude.gov" 
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Senha</label>
            <input 
              type="password" 
              value={senha} 
              onChange={e => setSenha(e.target.value)} 
              required 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
              placeholder="••••••••" 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
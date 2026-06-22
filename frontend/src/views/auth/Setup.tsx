import React, { useState } from 'react';
import { realizarSetup } from '../../services/auth.api';

export default function Setup() {
  const [formData, setFormData] = useState({ nome: '', email: '', municipio: '', senha: '' });

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await realizarSetup(formData);
      alert('Configuração inicial concluída! Agora faça login.');
      window.location.href = '/'; 
    } catch (err) {
      alert('Erro ao criar sistema.');
    }
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center h-screen w-full absolute top-0 left-0 z-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">⚙️ Setup Inicial</h1>
          <p className="text-gray-600 text-sm mt-1">Crie o administrador mestre do sistema.</p>
        </div>
        <form onSubmit={handleSetup}>
          <div className="mb-4">
            <label className="block text-gray-700 text-xs font-bold mb-1">Nome Completo</label>
            <input 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
              placeholder="Seu nome" 
              required 
              onChange={e => setFormData({...formData, nome: e.target.value})} 
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-xs font-bold mb-1">E-mail Institucional</label>
            <input 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
              placeholder="admin@saude.gov" 
              type="email" 
              required 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-xs font-bold mb-1">Município Base</label>
            <input 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
              placeholder="Ex: Manaus" 
              required 
              onChange={e => setFormData({...formData, municipio: e.target.value})} 
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-xs font-bold mb-1">Senha Mestra</label>
            <input 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" 
              placeholder="••••••••" 
              type="password" 
              required 
              onChange={e => setFormData({...formData, senha: e.target.value})} 
            />
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors">
            Criar Ecossistema
          </button>
        </form>
      </div>
    </div>
  );
}
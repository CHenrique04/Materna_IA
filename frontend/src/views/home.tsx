import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      
      {/* Cabeçalho do Dashboard */}
      <header className="mb-8 border-b border-gray-200 pb-6 mt-4">
        <p className="text-gray-500 text-lg mt-2">
          Painel de Controle - Sistema Distribuído de Triagem e Monitoramento
        </p>
      </header>

      {/* Grid de Métricas (Para impressionar na apresentação) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Gestantes Ativas</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">142</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Consultas Hoje</div>
          <div className="text-3xl font-bold text-green-500 mt-2">18</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Alertas Críticos</div>
          <div className="text-3xl font-bold text-red-500 mt-2">5</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Nós / Municípios</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">4</div>
        </div>
      </div>

      {/* Módulos do Sistema */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Módulos de Gestão</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Cartão de Gestantes */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-blue-600 mb-3">👩‍⚕️ Gestantes</h2>
          <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
            Gerencie o cadastro, visualize os prontuários e monitore os dados clínicos das pacientes no sistema.
          </p>
          <Link 
            to="/gestantes" 
            className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors"
          >
            Acessar Prontuários
          </Link>
        </div>

        {/* Cartão de Administradores */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-indigo-600 mb-3">👥 Administradores</h2>
          <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
            Controle os acessos, cargos e lotações de municípios dos gestores e profissionais de saúde.
          </p>
          <Link 
            to="/administradores" 
            className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors"
          >
            Acessar Controle
          </Link>
        </div>

        {/* Cartão de Alertas (Visual) */}
        <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200 flex flex-col">
          <h2 className="text-xl font-bold text-orange-500 mb-3">⚠️ Monitor de Webhook</h2>
          <p className="text-gray-500 mb-6 flex-grow leading-relaxed">
            Painel de recebimento das mensagens descentralizadas do WhatsApp e motor de inferência.
          </p>
          <button 
            disabled 
            className="block w-full text-center bg-gray-300 text-gray-500 py-2.5 px-4 rounded-lg font-semibold cursor-not-allowed"
          >
            Em Desenvolvimento
          </button>
        </div>

      </div>
    </div>
  );
}
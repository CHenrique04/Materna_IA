import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarUsuarios } from '../services/usuarios.api';
import { listarTodasConsultas } from '../services/consultas.api';
import { listarAdministradores } from '../services/administradores.api';

export default function Home() {
  const [metricas, setMetricas] = useState({
    gestantes: 0,
    consultasHoje: 0,
    alertas: 0, // Ficará 0 até o motor de inferência ser construído
    municipios: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarMetricas = async () => {
      try {
        // Busca os dados de forma INDEPENDENTE. 
        // O .catch(() => []) garante que se der erro em um, ele assume como vazio (0) e não quebra os outros!
        const gestantesData = await listarUsuarios().catch(() => []);
        const consultasData = await listarTodasConsultas().catch(() => []);
        const adminsData = await listarAdministradores().catch(() => []);

        // 1. Total de Gestantes
        const totalGestantes = gestantesData.length || 0;

        // 2. Consultas de Hoje
        const hoje = new Date().toLocaleDateString('pt-BR');
        const consultasDeHoje = consultasData.filter((c: any) => {
          if (!c.dataHora) return false;
          const dataConsulta = new Date(c.dataHora).toLocaleDateString('pt-BR');
          return dataConsulta === hoje;
        }).length || 0;

        // 3. Municípios Únicos (Baseado na lotação dos Administradores)
        const municipiosUnicos = new Set(
          adminsData
            .map((admin: any) => admin.municipio?.trim().toLowerCase())
            .filter(Boolean) // Remove os nulos ou vazios
        );
        const totalMunicipios = municipiosUnicos.size || 0;

        // Atualiza os painéis com os dados reais
        setMetricas({
          gestantes: totalGestantes,
          consultasHoje: consultasDeHoje,
          alertas: 0, 
          municipios: totalMunicipios
        });
      } catch (error) {
        console.error("Erro geral ao carregar métricas do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarMetricas();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      
      {/* Cabeçalho do Dashboard */}
      <header className="mb-8 border-b border-gray-200 pb-6 mt-4">
        <p className="text-gray-500 text-lg mt-2">
          Painel de Controle - Sistema Distribuído de Triagem e Monitoramento
        </p>
      </header>

      {/* Grid de Métricas Dinâmico */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Gestantes Ativas</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {loading ? '...' : metricas.gestantes}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Consultas Hoje</div>
          <div className="text-3xl font-bold text-green-500 mt-2">
            {loading ? '...' : metricas.consultasHoje}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Alertas Críticos</div>
          <div className="text-3xl font-bold text-red-500 mt-2">
            {loading ? '...' : metricas.alertas}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Nós / Municípios</div>
          <div className="text-3xl font-bold text-purple-600 mt-2">
            {loading ? '...' : metricas.municipios}
          </div>
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

        {/* Cartão de Alertas / Telegram (Atualizado) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-sky-500 mb-3">🤖 Monitor do Telegram</h2>
          <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
            Acompanhe o fluxo de mensagens, transcrições de áudio e a triagem feita pela IA com as pacientes.
          </p>
          <Link 
            to="/monitor-telegram" 
            className="block text-center bg-sky-500 hover:bg-sky-600 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors"
          >
            Acessar Monitor
          </Link>
        </div>

      </div>
    </div>
  );
}
// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { verificarSetup } from './services/auth.api';
import CalendarioConsultas from './views/consultas/CalendarioConsultas';
import RelatorioAcessos from './views/administrador/RelatorioAcessos';
import MonitorTelegram from './views/monitor/MonitorTelegram';

// Páginas de Autenticação
import Login from './views/auth/Login';
import Setup from './views/auth/Setup';

// Páginas do Sistema
import Home from './views/home';
import ListaGestantes from './views/gestante/ListaGestantes';
import FormGestante from './views/gestante/FormGestante';
import DetalheGestante from './views/gestante/DetalheGestante';
import ListaAdministradores from './views/administrador/ListaAdministradores';
import FormAdministrador from './views/administrador/FormAdministrador';

function App() {
  const [setupCheck, setSetupCheck] = useState<'carregando' | 'precisa_setup' | 'pronto' | 'erro_conexao'>('carregando');
  const [alertas, setAlertas] = useState<any[]>([]);
  const logado = !!sessionStorage.getItem('token');

  useEffect(() => {
    verificarSetup()
      .then((isComplete) => {
        if (!isComplete) {
          sessionStorage.removeItem('token');
          setSetupCheck('precisa_setup');
        } else {
          setSetupCheck('pronto');
        }
      })
      .catch((error) => {
        console.error("Erro na verificação do Setup:", error);
        setSetupCheck('erro_conexao');
      });
  }, []);

  // NOVO: Sistema de Polling para Alertas Críticos (A cada 10s)
  useEffect(() => {
    if (!logado) return;
    
    const buscarAlertas = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/usuarios/alertas/pendentes');
        const data = await res.json();
        setAlertas(data);
      } catch (error) {
        console.error("Erro ao buscar alertas", error);
      }
    };

    buscarAlertas(); // Busca imediatamente ao carregar
    const interval = setInterval(buscarAlertas, 10000); 
    return () => clearInterval(interval);
  }, [logado]);

  const resolverAlerta = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/api/usuarios/alertas/${id}/resolver`, { method: 'PUT' });
      setAlertas(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      alert("Erro ao resolver alerta.");
    }
  };

  // 1. Barreira de Loading
  if (setupCheck === 'carregando') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100">
        <div className="text-blue-600 font-bold text-xl mb-4">Iniciando Ecossistema Materna.IA...</div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. Barreira: Erro de Conexão com o Backend
  if (setupCheck === 'erro_conexao') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100 px-4 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4">🔌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Erro de Conexão</h1>
          <p className="text-gray-600 mb-6">O frontend não conseguiu se comunicar com o backend.</p>
          <button onClick={() => window.location.reload()} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Tentar Novamente</button>
        </div>
      </div>
    );
  }

  // 3. Barreira de Setup
  if (setupCheck === 'precisa_setup') {
    return <BrowserRouter><Routes><Route path="*" element={<Setup />} /></Routes></BrowserRouter>;
  }

  // 4. Barreira de Login
  if (!logado) {
    return <BrowserRouter><Routes><Route path="*" element={<Login />} /></Routes></BrowserRouter>;
  }

  // 5. Acesso Liberado
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col relative">
        
        {/* COMPONENTE DE ALERTA GLOBAL */}
        {alertas.length > 0 && (
          <div className="fixed inset-0 z-[100] bg-black bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border-t-8 border-red-600 animate-pulse">
              <h2 className="text-3xl font-extrabold text-red-600 mb-4 flex items-center gap-2">
                <span>🚨</span> EMERGÊNCIA DETECTADA
              </h2>
              
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {alertas.map(alerta => (
                  <div key={alerta.id} className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="font-bold text-lg text-gray-800 mb-1">Paciente: {alerta.usuario?.nome} ({alerta.usuario?.telefone})</p>
                    <p className="text-red-700 font-medium mb-3 bg-red-100 p-2 rounded">Motivo: {alerta.resumo}</p>
                    
                    <div className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Contato de Emergência:</p>
                        <p className="font-bold">{alerta.usuario?.nomeEmergencia || 'Não informado'} - {alerta.usuario?.numeroEmergencia}</p>
                      </div>
                      <button 
                        onClick={() => resolverAlerta(alerta.id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Marcar como Resolvido
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BARRA DE NAVEGAÇÃO GLOBAL */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="text-2xl font-extrabold text-gray-800 tracking-tight">Materna<span className="text-blue-600">.IA</span></Link>
              <div className="flex space-x-6 items-center">
                <Link to="/gestantes" className="text-gray-600 hover:text-blue-600 font-medium">Gestantes</Link>
                <Link to="/administradores" className="text-gray-600 hover:text-blue-600 font-medium">Administradores</Link>
                <button onClick={() => { sessionStorage.removeItem('token'); window.location.reload(); }} className="text-red-500 font-bold ml-4 px-3 py-1 bg-red-50 rounded">Sair</button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-grow pt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gestantes" element={<ListaGestantes />} />
            <Route path="/nova" element={<FormGestante />} />
            <Route path="/editar/:id" element={<FormGestante />} />
            <Route path="/gestantes/:id" element={<DetalheGestante />} />
            <Route path="/administradores" element={<ListaAdministradores />} />
            <Route path="/administradores/novo" element={<FormAdministrador />} />
            <Route path="/administradores/editar/:id" element={<FormAdministrador />} />
            <Route path="/consultas" element={<CalendarioConsultas />} />
            <Route path="/acessos" element={<RelatorioAcessos />} />
            <Route path="/monitor-telegram" element={<MonitorTelegram />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
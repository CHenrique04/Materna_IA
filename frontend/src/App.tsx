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
  // Novo estado de erro de conexão adicionado
  const [setupCheck, setSetupCheck] = useState<'carregando' | 'precisa_setup' | 'pronto' | 'erro_conexao'>('carregando');
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
        // Agora, em vez de fingir que está tudo pronto, mostramos o erro
        setSetupCheck('erro_conexao');
      });
  }, []);

  // 1. Barreira de Loading
  if (setupCheck === 'carregando') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100">
        <div className="text-blue-600 font-bold text-xl mb-4">Iniciando Ecossistema Materna.IA...</div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. Nova Barreira: Erro de Conexão com o Backend
  if (setupCheck === 'erro_conexao') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100 px-4 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4">🔌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Erro de Conexão</h1>
          <p className="text-gray-600 mb-6">
            O frontend não conseguiu se comunicar com o backend para verificar o banco de dados.
          </p>
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded text-left">
            <p className="font-bold mb-1">Verifique se:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>O backend está rodando (<code className="bg-gray-200 px-1 rounded">npm run dev</code>).</li>
              <li>A rota <code className="bg-gray-200 px-1 rounded">/auth/check-setup</code> existe.</li>
              <li>Não há erros de CORS no terminal.</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // 3. Barreira de Setup (Banco vazio = Força a criar o 1º Admin)
  if (setupCheck === 'precisa_setup') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Setup />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // 4. Barreira de Login (Tem admin no banco, mas usuário não está logado)
  if (!logado) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // 5. Acesso Liberado (Usuário Logado) -> Mostra o seu App original
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col">
        
        {/* === BARRA DE NAVEGAÇÃO GLOBAL (NAVBAR) === */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex justify-between items-center h-16">
              
              <Link to="/" className="text-2xl font-extrabold text-gray-800 tracking-tight hover:opacity-80 transition-opacity">
                Materna<span className="text-blue-600">.IA</span>
              </Link>

              <div className="flex space-x-6 items-center">
                <Link to="/gestantes" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Gestantes
                </Link>
                <Link to="/administradores" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Administradores
                </Link>
                <Link to="/consultas" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Consultas
                </Link>
                <Link to="/acessos" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  Logs de Acesso
                </Link>
                
                <button 
                  onClick={() => { 
                    sessionStorage.removeItem('token'); 
                    window.location.reload();
                  }} 
                  className="text-red-500 hover:text-red-700 font-bold ml-4 px-3 py-1 bg-red-50 hover:bg-red-100 rounded transition-colors"
                >
                  Sair
                </button>
              </div>

            </div>
          </div>
        </nav>
        {/* ========================================== */}

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
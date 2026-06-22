// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { verificarSetup } from './services/auth.api';
import CalendarioConsultas from './views/consultas/CalendarioConsultas';
import RelatorioAcessos from './views/administrador/RelatorioAcessos';

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
  // Estados para controle de acesso
  const [setupCheck, setSetupCheck] = useState<'carregando' | 'precisa_setup' | 'pronto'>('carregando');
  const logado = !!localStorage.getItem('token'); // Verifica se o token existe no navegador

  // Quando o App abre, ele pergunta pro backend se o banco já tem um admin
  // Quando o App abre, ele pergunta pro backend se o banco já tem um admin
  useEffect(() => {
    verificarSetup()
      .then((isComplete) => {
        if (!isComplete) {
          localStorage.removeItem('token');
          setSetupCheck('precisa_setup');
        } else {
          setSetupCheck('pronto');
        }
      })
      .catch(() => setSetupCheck('pronto'));
  }, []);

  // 1. Barreira de Loading (Enquanto checa o banco)
  if (setupCheck === 'carregando') {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100 text-blue-600 font-bold text-xl">
        Iniciando Ecossistema...
      </div>
    );
  }

  // 2. Barreira de Setup (Banco vazio = Força a criar o 1º Admin)
  if (setupCheck === 'precisa_setup') {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Setup />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // 3. Barreira de Login (Tem admin no banco, mas usuário não está logado)
  if (!logado) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // 4. Acesso Liberado (Usuário Logado) -> Mostra o seu App original
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col">
        
        {/* === BARRA DE NAVEGAÇÃO GLOBAL (NAVBAR) === */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex justify-between items-center h-16">
              
              {/* Logo / Voltar para Home */}
              <Link to="/" className="text-2xl font-extrabold text-gray-800 tracking-tight hover:opacity-80 transition-opacity">
                Materna<span className="text-blue-600">.IA</span>
              </Link>

              {/* Links do Menu */}
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
                
                {/* Botão de Sair adicionado */}
                <button 
                  onClick={() => { 
                    localStorage.removeItem('token'); 
                    window.location.reload(); // Recarrega a página para acionar a Barreira de Login
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

        {/* Conteúdo dinâmico das páginas */}
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
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;
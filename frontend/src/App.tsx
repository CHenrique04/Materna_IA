// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './views/home';
import ListaGestantes from './views/gestante/ListaGestantes';
import FormGestante from './views/gestante/FormGestante';
import DetalheGestante from './views/gestante/DetalheGestante';
import ListaAdministradores from './views/administrador/ListaAdministradores';
import FormAdministrador from './views/administrador/FormAdministrador';

function App() {
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
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;
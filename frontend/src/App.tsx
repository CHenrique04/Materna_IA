import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import ListaGestantes from './views/gestante/ListaGestantes';
import FormGestante from './views/gestante/FormGestante';
import DetalheGestante from './views/gestante/DetalheGestante';

function App() {
  return (
    <BrowserRouter>
      {/* Container principal para manter o fundo escuro globalmente */}
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', margin: 0, padding: 0 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gestantes" element={<ListaGestantes />} />
          <Route path="/nova" element={<FormGestante />} />
          <Route path="/editar/:id" element={<FormGestante />} />
          <Route path="/gestantes/:id" element={<DetalheGestante />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
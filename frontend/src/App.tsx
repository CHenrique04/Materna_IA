// frontend/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ListaGestantes from './views/ListaGestantes';
import FormGestante from './views/FormGestante';
import DetalheGestante from './views/DetalheGestante';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ListaGestantes />} />
        <Route path="/nova" element={<FormGestante />} />
        <Route path="/editar/:id" element={<FormGestante />} />
        <Route path="/gestantes/:id" element={<DetalheGestante />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
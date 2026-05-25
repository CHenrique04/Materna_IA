// frontend/src/views/ListaGestantes.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarUsuarios, deletarUsuario } from '../../services/usuarios.api';
import type { Usuario } from '../../types/Usuario';

const ListaGestantes: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const dados = await listarUsuarios();
      setUsuarios(dados);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar lista de gestantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const handleExcluir = async (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a gestante "${nome}"?`)) {
      try {
        await deletarUsuario(id);
        // Recarrega a lista após exclusão
        await carregarUsuarios();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir gestante');
      }
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-teal-400 font-medium animate-pulse text-lg">Carregando prontuários...</div>
    </div>
  );
  
  if (error) return (
    <div className="container mx-auto p-6 mt-6 bg-rose-500/10 border border-rose-500/20 rounded-lg text-center">
      <span className="text-rose-400 font-medium">{error}</span>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Gestantes</h1>
          <p className="text-slate-400 mt-1 text-sm">Gerenciamento de prontuários e pacientes ativas.</p>
        </div>
        <button
          onClick={() => navigate('/nova')}
          className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-teal-500/20 transition-all active:scale-95"
        >
          + Nova Gestante
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-slate-800 shadow-xl rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700/50">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-teal-400 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-teal-400 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-teal-400 uppercase tracking-wider">
                  Data de Nascimento
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-teal-400 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-teal-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                    Nenhuma gestante cadastrada no sistema.
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-200">
                      {usuario.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">
                      {usuario.telefone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">
                      {usuario.dataNascimento
                        ? new Date(usuario.dataNascimento).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">
                      {new Date(usuario.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-3 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/gestantes/${usuario.id}`)}
                        className="inline-flex items-center text-xs font-medium text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Detalhes
                      </button>
                      <button
                        onClick={() => navigate(`/editar/${usuario.id}`)}
                        className="inline-flex items-center text-xs font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluir(usuario.id, usuario.nome)}
                        className="inline-flex items-center text-xs font-medium text-rose-400 bg-rose-400/10 hover:bg-rose-400/20 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListaGestantes;
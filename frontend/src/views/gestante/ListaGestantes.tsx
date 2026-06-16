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

  // Ajustei o loading para o tema claro
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-blue-600 font-medium animate-pulse text-lg">Carregando prontuários...</div>
    </div>
  );
  
  // Ajustei o erro para o tema claro
  if (error) return (
    <div className="container mx-auto p-6 mt-6 bg-red-100 border border-red-400 rounded-lg text-center">
      <span className="text-red-700 font-medium">{error}</span>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">👩‍👧 Gestantes Cadastradas</h1>
        <button
          onClick={() => navigate('/nova')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition-colors"
        >
          + Nova Gestante
        </button>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Telefone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Nasc.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cadastro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                  Nenhuma gestante cadastrada no sistema.
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">
                    {usuario.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {usuario.telefone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {usuario.dataNascimento
                      ? new Date(usuario.dataNascimento).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(usuario.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-3 text-sm font-medium">
                    <button
                      onClick={() => navigate(`/gestantes/${usuario.id}`)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      Detalhes
                    </button>
                    <button
                      onClick={() => navigate(`/editar/${usuario.id}`)}
                      className="text-yellow-600 hover:text-yellow-900 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleExcluir(usuario.id, usuario.nome)}
                      className="text-red-600 hover:text-red-900 transition-colors"
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
  );
};

export default ListaGestantes;
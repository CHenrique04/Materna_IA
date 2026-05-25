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

  if (loading) return <div className="p-4">Carregando gestantes...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestantes</h1>
        <button
          onClick={() => navigate('/nova')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          + Nova Gestante
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
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
                Data de Nascimento
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
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td className="px-6 py-4 whitespace-nowrap">{usuario.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap">{usuario.telefone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {usuario.dataNascimento
                    ? new Date(usuario.dataNascimento).toLocaleDateString()
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(usuario.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => navigate(`/gestantes/${usuario.id}`)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Detalhes
                  </button>
                  <button
                    onClick={() => navigate(`/editar/${usuario.id}`)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(usuario.id, usuario.nome)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaGestantes;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarAdministradores, deletarAdministrador } from '../../services/administradores.api';
import { Administrador } from '../../types/Administrador';

const ListaAdministradores: React.FC = () => {
  const [admins, setAdmins] = useState<Administrador[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      const dados = await listarAdministradores();
      setAdmins(dados);
    } catch (error) {
      console.error("Erro ao carregar administradores", error);
    }
  };

  const handleExcluir = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este administrador?')) {
      try {
        await deletarAdministrador(id);
        await carregar(); // Recarrega a tabela se der sucesso
      } catch (err: any) {
        // Pega a mensagem de erro que mandamos do backend (Ação bloqueada...)
        const mensagemErro = err.response?.data?.error || 'Erro ao excluir administrador. Ele pode ser o último Administrador Geral.';
        alert(`❌ ${mensagemErro}`);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">👥 Administradores do Sistema</h1>
        <button 
          onClick={() => navigate('/administradores/novo')} 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition-colors"
        >
          + Novo Admin
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Município</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map(admin => (
              <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">{admin.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{admin.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* Badge colorida para o cargo */}
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    admin.cargo === 'ADMIN_GERAL' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {admin.cargo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{admin.municipio}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  <button 
                    onClick={() => navigate(`/administradores/editar/${admin.id}`)} 
                    className="text-yellow-600 hover:text-yellow-900 transition-colors"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleExcluir(admin.id)} 
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            
            {admins.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                  Nenhum administrador encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaAdministradores;
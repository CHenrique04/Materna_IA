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
    const dados = await listarAdministradores();
    setAdmins(dados);
  };

  const handleExcluir = async (id: number) => {
    if (confirm('Excluir administrador?')) {
      await deletarAdministrador(id);
      await carregar();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Administradores</h1>
        <button onClick={() => navigate('/administradores/novo')} className="bg-green-600 text-white px-4 py-2 rounded">+ Novo Admin</button>
      </div>
      <table className="min-w-full bg-white border">
        <thead>
          <tr><th className="py-2 px-4 border">Nome</th><th>Email</th><th>Cargo</th><th>Município</th><th>Ações</th></tr>
        </thead>
        <tbody>
          {admins.map(admin => (
            <tr key={admin.id}>
              <td className="border px-4 py-2">{admin.nome}</td>
              <td className="border px-4 py-2">{admin.email}</td>
              <td className="border px-4 py-2">{admin.cargo}</td>
              <td className="border px-4 py-2">{admin.municipio}</td>
              <td className="border px-4 py-2">
                <button onClick={() => navigate(`/administradores/editar/${admin.id}`)} className="text-yellow-600 mr-2">Editar</button>
                <button onClick={() => handleExcluir(admin.id)} className="text-red-600">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ListaAdministradores;
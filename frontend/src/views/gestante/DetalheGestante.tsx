// frontend/src/views/DetalheGestante.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buscarUsuario, listarMensagens } from '../../services/usuarios.api';
import type { Usuario, Mensagem } from '../../types/Usuario';

const DetalheGestante: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [usuarioData, mensagensData] = await Promise.all([
          buscarUsuario(Number(id)),
          listarMensagens(Number(id)),
        ]);
        setUsuario(usuarioData);
        setMensagens(mensagensData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados da gestante');
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [id]);

  if (loading) return <div className="p-4">Carregando dados...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!usuario) return <div className="p-4">Gestante não encontrada</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <button
          onClick={() => navigate('/')}
          className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded"
        >
          ← Voltar
        </button>
      </div>

      {/* Dados pessoais */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{usuario.nome}</h1>
        <p><strong>Telefone:</strong> {usuario.telefone}</p>
        <p><strong>Data de Nascimento:</strong> {usuario.dataNascimento || 'Não informada'}</p>
        <p><strong>Data da Última Menstruação:</strong> {usuario.dataUltimaMenstruacao || 'Não informada'}</p>
        <p><strong>Cadastrado em:</strong> {new Date(usuario.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Log de Conversas */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">📝 Histórico de Conversas</h2>
        {mensagens.length === 0 ? (
          <p className="text-gray-500">Nenhuma mensagem trocada ainda.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto border p-3 rounded">
            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.direcao === 'entrada' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.direcao === 'entrada'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  <p>{msg.texto}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exames e Consultas (placeholders para desenvolvimento futuro) */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">🩺 Exames</h2>
        <p className="text-gray-500">Em breve: gerenciamento de exames.</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">📅 Consultas</h2>
        <p className="text-gray-500">Em breve: agendamento e histórico de consultas.</p>
      </div>
    </div>
  );
};

export default DetalheGestante;
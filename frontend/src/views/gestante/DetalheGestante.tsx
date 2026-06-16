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
  
  // Novo estado para controlar qual aba está aparecendo
  const [abaAtiva, setAbaAtiva] = useState<'conversas' | 'exames' | 'consultas'>('conversas');

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

  if (loading) return <div className="p-4 text-center text-blue-600 font-medium">Carregando dados da paciente...</div>;
  if (error) return <div className="p-4 text-center text-red-600 font-medium">{error}</div>;
  if (!usuario) return <div className="p-4 text-center text-gray-500">Gestante não encontrada</div>;

  // Função auxiliar para mudar a cor da aba quando ela estiver selecionada
  const getTabClass = (aba: string) => {
    return abaAtiva === aba
      ? "border-b-2 border-blue-600 text-blue-600 px-6 py-3 text-sm font-medium focus:outline-none"
      : "px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none transition-colors";
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Botão voltar */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/gestantes')}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
        >
          ← Voltar
        </button>
      </div>

      {/* Dados pessoais */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">{usuario.nome}</h1>
        <p className="text-gray-700"><strong>Telefone:</strong> {usuario.telefone}</p>
        <p className="text-gray-700"><strong>Data de Nascimento:</strong> {usuario.dataNascimento ? new Date(usuario.dataNascimento).toLocaleDateString() : 'Não informada'}</p>
        <p className="text-gray-700"><strong>Data da Última Menstruação:</strong> {usuario.dataUltimaMenstruacao ? new Date(usuario.dataUltimaMenstruacao).toLocaleDateString() : 'Não informada'}</p>
        <p className="text-gray-700"><strong>Cadastro:</strong> {new Date(usuario.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Abas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        
        {/* Navegação das Abas */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button 
            onClick={() => setAbaAtiva('conversas')} 
            className={getTabClass('conversas')}
          >
            📝 Conversas
          </button>
          <button 
            onClick={() => setAbaAtiva('exames')} 
            className={getTabClass('exames')}
          >
            🩺 Exames
          </button>
          <button 
            onClick={() => setAbaAtiva('consultas')} 
            className={getTabClass('consultas')}
          >
            📅 Consultas
          </button>
        </div>

        {/* Conteúdo Dinâmico das Abas */}
        <div className="p-6">
          
          {/* Aba: Conversas */}
          {abaAtiva === 'conversas' && (
            <div>
              {mensagens.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma mensagem registrada no histórico.</p>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {mensagens.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.direcao === 'entrada' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`px-4 py-2 rounded-lg max-w-xs md:max-w-md ${
                          msg.direcao === 'entrada'
                            ? 'bg-gray-200 text-gray-800' // Mensagem da Gestante
                            : 'bg-blue-500 text-white shadow-sm' // Mensagem do Bot/Sistema
                        }`}
                      >
                        <p className="leading-relaxed">{msg.texto}</p>
                        <p className={`text-[10px] mt-1 text-right ${msg.direcao === 'entrada' ? 'text-gray-500' : 'text-blue-200'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Aba: Exames */}
          {abaAtiva === 'exames' && (
            <div className="py-8 text-center">
              <span className="text-4xl block mb-3">🩺</span>
              <h3 className="text-lg font-semibold text-gray-800">Módulo de Exames</h3>
              <p className="text-gray-500 mt-1">O gerenciamento de PDFs e resultados de exames será implementado nas próximas sprints.</p>
            </div>
          )}

          {/* Aba: Consultas */}
          {abaAtiva === 'consultas' && (
            <div className="py-8 text-center">
              <span className="text-4xl block mb-3">📅</span>
              <h3 className="text-lg font-semibold text-gray-800">Agenda de Consultas</h3>
              <p className="text-gray-500 mt-1">O histórico de comparecimento e agendamento de consultas na UBS estará disponível em breve.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DetalheGestante;
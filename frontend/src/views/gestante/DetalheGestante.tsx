// frontend/src/views/gestante/DetalheGestante.tsx
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
  
  const [abaAtiva, setAbaAtiva] = useState<'conversas' | 'exames' | 'consultas'>('conversas');

  // Dados simulados de exames para a apresentação do Ciclo 1
  const [exames] = useState([
    { id: 1, tipo: 'Ultrassom Obstétrico', data: '2026-05-10', resultado: 'Normal', anexo: true },
    { id: 2, tipo: 'Glicemia de Jejum', data: '2026-05-20', resultado: '95 mg/dL', anexo: false },
    { id: 3, tipo: 'Hemograma Completo', data: '2026-06-05', resultado: 'Anemia Leve', anexo: true },
  ]);

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

  const getTabClass = (aba: string) => {
    return abaAtiva === aba
      ? "border-b-2 border-blue-600 text-blue-600 px-6 py-3 text-sm font-medium focus:outline-none bg-white"
      : "px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none transition-colors";
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Botão voltar */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/gestantes')}
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors font-semibold shadow-sm"
        >
          ← Voltar
        </button>
      </div>

      {/* Dados pessoais */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-gray-800">{usuario.nome}</h1>
            <p className="text-gray-600 mb-1"><strong>📞 Telefone:</strong> {usuario.telefone}</p>
            <p className="text-gray-600 mb-1"><strong>🎂 Data de Nascimento:</strong> {usuario.dataNascimento ? new Date(usuario.dataNascimento).toLocaleDateString('pt-BR') : 'Não informada'}</p>
            <p className="text-gray-600 mb-1"><strong>🩸 DUM:</strong> {usuario.dataUltimaMenstruacao ? new Date(usuario.dataUltimaMenstruacao).toLocaleDateString('pt-BR') : 'Não informada'}</p>
          </div>
          <div className="text-right">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
              Paciente Ativa
            </span>
            <p className="text-gray-400 text-xs mt-2">
              Cadastrada em {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Navegação das Abas */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button onClick={() => setAbaAtiva('conversas')} className={getTabClass('conversas')}>
            💬 Histórico do Chat
          </button>
          <button onClick={() => setAbaAtiva('exames')} className={getTabClass('exames')}>
            🩺 Exames
          </button>
          <button onClick={() => setAbaAtiva('consultas')} className={getTabClass('consultas')}>
            📅 Consultas
          </button>
        </div>

        {/* Conteúdo Dinâmico das Abas */}
        <div className="p-0">
          
          {/* Aba: Conversas */}
          {abaAtiva === 'conversas' && (
            <div className="p-6 bg-gray-50/50">
              {mensagens.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                  <span className="text-4xl">📭</span>
                  <p className="text-gray-500 mt-3 font-medium">Nenhuma conversa registrada com o chatbot ainda.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {mensagens.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.direcao === 'entrada' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`px-4 py-3 rounded-2xl max-w-xs md:max-w-md shadow-sm ${
                          msg.direcao === 'entrada' ? 'bg-white border border-gray-200 text-gray-800 rounded-bl-none' : 'bg-blue-600 text-white rounded-br-none'
                        }`}>
                        <p className="leading-relaxed">{msg.texto}</p>
                        <p className={`text-[10px] mt-2 text-right font-medium ${msg.direcao === 'entrada' ? 'text-gray-400' : 'text-blue-200'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Resultados de Exames</h3>
                <button 
                  onClick={() => alert("O upload de PDFs será liberado na fase 2 do projeto!")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow transition-colors font-semibold text-sm"
                >
                  + Novo Exame
                </button>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Exame</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultado / Laudo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anexo (PDF)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {exames.map((exame) => (
                      <tr key={exame.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{exame.tipo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {new Date(exame.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{exame.resultado}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {exame.anexo ? (
                            <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                              📄 Ver PDF
                            </button>
                          ) : (
                            <span className="text-gray-400 italic">Sem anexo</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-red-600 hover:text-red-800 font-medium">Excluir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Aba: Consultas */}
          {abaAtiva === 'consultas' && (
            <div className="py-12 text-center">
              <span className="text-4xl block mb-3">📅</span>
              <h3 className="text-lg font-semibold text-gray-800">Agenda da Paciente</h3>
              <p className="text-gray-500 mt-1 max-w-md mx-auto">
                As consultas agendadas desta paciente aparecerão aqui. (Integração com a rota global de consultas em breve).
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DetalheGestante;
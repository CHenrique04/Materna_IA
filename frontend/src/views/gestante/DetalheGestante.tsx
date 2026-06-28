// frontend/src/views/gestante/DetalheGestante.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buscarUsuario } from '../../services/usuarios.api';

const DetalheGestante: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [usuario, setUsuario] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState<'conversas' | 'exames' | 'topicos' | 'consultas'>('conversas');

  useEffect(() => {
    const carregarDados = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Agora o backend traz exames e topicos aninhados dentro do usuário
        const usuarioData = await buscarUsuario(Number(id));
        setUsuario(usuarioData);
      } catch (err) {
        setError('Erro ao carregar dados da gestante');
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [id]);

  if (loading) return <div className="p-4 text-center">Carregando dados...</div>;
  if (error || !usuario) return <div className="p-4 text-center text-red-600">{error || 'Não encontrada'}</div>;

  const getTabClass = (aba: string) => abaAtiva === aba
      ? "border-b-2 border-blue-600 text-blue-600 px-6 py-3 font-bold bg-white"
      : "px-6 py-3 font-medium text-gray-600 hover:bg-gray-50";

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <button onClick={() => navigate('/gestantes')} className="mb-4 bg-gray-500 text-white py-2 px-4 rounded shadow-sm">← Voltar</button>

      {/* CABEÇALHO */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{usuario.nome}</h1>
          <p className="text-gray-600"><strong>Telefone:</strong> {usuario.telefone}</p>
          <p className="text-gray-600"><strong>Gestação:</strong> {usuario.semanasGestacao ? `${usuario.semanasGestacao} semanas` : 'N/I'}</p>
          <p className="text-gray-600"><strong>Contato Emergência:</strong> {usuario.nomeEmergencia} ({usuario.numeroEmergencia})</p>
        </div>
        <div className="text-right max-w-xs">
          <div className="bg-orange-100 border border-orange-200 p-3 rounded text-sm text-orange-800 mb-2">
            <strong>Histórico de Saúde:</strong> {usuario.historicoSaude || 'Nenhum relatado'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
          <button onClick={() => setAbaAtiva('conversas')} className={getTabClass('conversas')}>💬 Chat & Sentimento</button>
          <button onClick={() => setAbaAtiva('exames')} className={getTabClass('exames')}>🩺 Exames (Uploads)</button>
          <button onClick={() => setAbaAtiva('topicos')} className={getTabClass('topicos')}>📝 Tópicos p/ Médico</button>
          <button onClick={() => setAbaAtiva('consultas')} className={getTabClass('consultas')}>📅 Consultas</button>
        </div>

        <div className="p-0">
          
          {/* ABA: CHAT */}
          {abaAtiva === 'conversas' && (
            <div className="p-6 bg-gray-50 h-[500px] overflow-y-auto">
              {usuario.mensagens?.map((msg: any) => (
                <div key={msg.id} className={`flex flex-col mb-4 ${msg.direcao === 'entrada' ? 'items-start' : 'items-end'}`}>
                  {/* Etiqueta de Sentimento (Somente nas respostas da IA) */}
                  {msg.sentimento && msg.direcao === 'saida' && (
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1 mr-2">
                      Humor Detectado: <span className="text-blue-600">{msg.sentimento}</span>
                    </span>
                  )}
                  
                  <div className={`px-4 py-3 rounded-2xl max-w-md shadow-sm ${msg.direcao === 'entrada' ? 'bg-white border text-gray-800 rounded-bl-none' : 'bg-blue-600 text-white rounded-br-none'}`}>
                    <p className="whitespace-pre-wrap">{msg.texto}</p>
                    <p className={`text-[10px] mt-1 text-right ${msg.direcao === 'entrada' ? 'text-gray-400' : 'text-blue-200'}`}>
                      {new Date(msg.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ABA: EXAMES */}
          {abaAtiva === 'exames' && (
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Arquivos Enviados via Telegram</h3>
              <div className="space-y-3">
                {usuario.exames?.length === 0 && <p className="text-gray-500 italic">Nenhum exame recebido.</p>}
                {usuario.exames?.map((exame: any) => (
                  <div key={exame.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-bold text-gray-800">{exame.tipo}</p>
                      <p className="text-sm text-gray-500">Recebido em: {new Date(exame.dataExame).toLocaleDateString('pt-BR')}</p>
                    </div>
                    {exame.arquivoUrl && (
                      <a 
                        href={`${exame.arquivoUrl}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded font-bold text-sm hover:bg-blue-200 transition"
                      >
                        Baixar / Visualizar PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA: TÓPICOS PARA O MÉDICO */}
          {abaAtiva === 'topicos' && (
            <div className="p-6">
              <h3 className="text-lg font-bold mb-2">Tópicos e Queixas Extraídos pela IA</h3>
              <p className="text-gray-500 mb-6 text-sm">Estes resumos foram gerados automaticamente com base nas interações da paciente.</p>
              
              <div className="grid gap-4">
                {usuario.topicos?.length === 0 && <p className="text-gray-400">Nenhum tópico registrado ainda.</p>}
                {usuario.topicos?.map((topico: any) => (
                  <div key={topico.id} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
                    <p className="text-gray-800 font-medium">{topico.textoResumo}</p>
                    <p className="text-xs text-gray-400 mt-2">Data: {new Date(topico.createdAt).toLocaleDateString('pt-BR')} - Status: {topico.status.toUpperCase()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA: CONSULTAS */}
          {abaAtiva === 'consultas' && (
            <div className="py-12 text-center text-gray-500">
              <span className="text-4xl block mb-3">📅</span>
              <p>Agenda da paciente em desenvolvimento.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DetalheGestante;
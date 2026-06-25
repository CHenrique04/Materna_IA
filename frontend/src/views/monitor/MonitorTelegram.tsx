import React, { useEffect, useState } from 'react';
import { listarUsuarios } from '../../services/usuarios.api';
import { listarMensagensDoUsuario } from '../../services/mensagens.api';

export default function MonitorTelegram() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const dados = await listarUsuarios();
      setUsuarios(dados);
    } catch (error) {
      console.error("Erro ao carregar usuários", error);
    } finally {
      setLoading(false);
    }
  };

  const selecionarUsuario = async (usuario: any) => {
    setSelectedUser(usuario);
    setLoadingChat(true);
    try {
      const msgs = await listarMensagensDoUsuario(usuario.id);
      setMensagens(msgs);
    } catch (error) {
      console.error("Erro ao carregar histórico", error);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">🤖 Monitor do Telegram</h1>
        <p className="text-gray-500">Acompanhe a triagem e o histórico de interações da IA.</p>
      </div>

      <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-grow">
        
        {/* Painel Lateral - Lista de Gestantes */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="font-bold text-gray-700">Pacientes Cadastradas</h2>
          </div>
          
          <div className="overflow-y-auto flex-grow">
            {loading ? (
              <p className="p-4 text-gray-500 text-center text-sm">Carregando...</p>
            ) : usuarios.length === 0 ? (
              <p className="p-4 text-gray-500 text-center text-sm">Nenhuma paciente encontrada.</p>
            ) : (
              usuarios.map(u => (
                <div 
                  key={u.id} 
                  onClick={() => selecionarUsuario(u)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${selectedUser?.id === u.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                >
                  <div className="font-semibold text-gray-800">{u.nome}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Gestação: {u.semanasGestacao ? `${u.semanasGestacao} semanas` : 'N/I'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Painel Principal - Chat */}
        <div className="w-2/3 flex flex-col bg-gray-50 relative">
          {selectedUser ? (
            <>
              {/* Cabeçalho do Chat (Mostra o Histórico Médico como Alerta) */}
              <div className="p-4 bg-white border-b border-gray-200 shadow-sm z-10 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{selectedUser.nome}</h3>
                  <p className="text-xs text-gray-500">Tel: {selectedUser.telefone}</p>
                </div>
                {selectedUser.historicoSaude && selectedUser.historicoSaude.toLowerCase() !== 'não' && selectedUser.historicoSaude.toLowerCase() !== 'nao' && (
                  <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-xs font-bold border border-orange-200 max-w-xs text-right">
                    ⚠️ Histórico: {selectedUser.historicoSaude}
                  </div>
                )}
              </div>

              {/* Área de Mensagens */}
              <div className="flex-grow p-6 overflow-y-auto flex flex-col space-y-4">
                {loadingChat ? (
                  <div className="text-center text-gray-400 mt-10">Carregando histórico...</div>
                ) : mensagens.length === 0 ? (
                  <div className="text-center text-gray-400 mt-10">
                    Nenhuma interação registrada com o bot ainda.
                  </div>
                ) : (
                  mensagens.map((msg) => {
                    const isIA = msg.direcao === 'saida';
                    return (
                      <div key={msg.id} className={`flex w-full ${isIA ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm relative ${
                          isIA 
                            ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none' 
                            : 'bg-blue-500 text-white rounded-tr-none'
                        }`}>
                          {/* Identificador de quem falou */}
                          <div className={`text-[10px] font-bold mb-1 uppercase tracking-wider ${isIA ? 'text-blue-500' : 'text-blue-100'}`}>
                            {isIA ? '🤖 Materna.IA' : '👩 Gestante'}
                          </div>
                          
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.texto}</p>
                          
                          <div className={`text-[10px] mt-2 text-right ${isIA ? 'text-gray-400' : 'text-blue-200'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-400">
              <span className="text-5xl mb-4">💬</span>
              <p>Selecione uma paciente na lista para visualizar a triagem.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
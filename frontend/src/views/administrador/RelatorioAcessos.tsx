import React, { useState, useEffect } from 'react';

export default function RelatorioAcessos() {
  const [loading, setLoading] = useState(true);
  
  // Dados simulados para a apresentação do Ciclo 1
  const [logs] = useState([
    { id: 1, nome: 'Carlos Almeida', dataHora: '2026-06-22T08:32:00', ip: '192.168.1.10', municipio: 'Manaus' },
    { id: 2, nome: 'Fernanda Lima', dataHora: '2026-06-21T17:45:00', ip: '10.0.0.22', municipio: 'Parintins' },
    { id: 3, nome: 'Jonathas (Você)', dataHora: '2026-06-22T16:10:00', ip: '172.16.254.1', municipio: 'Manaus' },
    { id: 4, nome: 'Dra. Ana Paula', dataHora: '2026-06-20T09:15:00', ip: '192.168.1.105', municipio: 'Tefé' },
  ]);

  // Simulando um tempo de carregamento de rede para dar um efeito mais real
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-blue-600 font-medium animate-pulse text-lg">Carregando logs de auditoria...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 Relatório de Acessos dos ADMs</h1>
          <p className="text-gray-500 mt-1">Histórico de auditoria e controle de sessões do sistema.</p>
        </div>
        <button 
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm transition-colors font-semibold flex items-center gap-2"
          onClick={() => alert("A exportação de logs será implementada na próxima fase!")}
        >
          <span>📥</span> Exportar PDF
        </button>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome do Administrador</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acesso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço IP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Município de Lotação</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => {
              const dataObj = new Date(log.dataHora);
              const dataFormatada = dataObj.toLocaleDateString('pt-BR');
              const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

              return (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">
                    {log.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {dataFormatada} às {horaFormatada}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-sm">
                    {log.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {log.municipio}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
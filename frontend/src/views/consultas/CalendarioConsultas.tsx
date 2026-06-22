// frontend/src/views/consultas/CalendarioConsultas.tsx
import React, { useState, useEffect } from 'react';
import { listarTodasConsultas, criarConsulta } from '../../services/consultas.api';
import { listarUsuarios } from '../../services/usuarios.api';

export default function CalendarioConsultas() {
  const [consultas, setConsultas] = useState<any[]>([]);
  const [gestantes, setGestantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados do formulário
  const [usuarioId, setUsuarioId] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [local, setLocal] = useState('');

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [consultasData, gestantesData] = await Promise.all([
        listarTodasConsultas(),
        listarUsuarios()
      ]);
      setConsultas(consultasData);
      setGestantes(gestantesData);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleAgendar = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Junta a data e a hora no formato ISO que o backend e o Prisma exigem
      const dataHoraIso = new Date(`${data}T${hora}:00`).toISOString();
      
      await criarConsulta({
        usuarioId: Number(usuarioId),
        dataHora: dataHoraIso,
        local: local
      });
      
      alert('Consulta agendada com sucesso!');
      setIsModalOpen(false);
      
      // Limpa o formulário e recarrega a tela
      setUsuarioId(''); setData(''); setHora(''); setLocal('');
      carregarDados();
    } catch (error) {
      alert('Erro ao agendar consulta. Verifique os dados.');
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center text-blue-600 font-medium">Carregando agenda...</div>;

  return (
    <div className="container mx-auto p-4 max-w-6xl relative">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📅 Próximas Consultas</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition-colors font-semibold"
        >
          + Agendar Consulta
        </button>
      </div>

      {/* Grid de Consultas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consultas.map((consulta) => {
          const dataObj = new Date(consulta.dataHora);
          const dataFormatada = dataObj.toLocaleDateString('pt-BR');
          const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={consulta.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="font-extrabold text-blue-600 text-lg mb-3 pb-2 border-b border-gray-100 flex justify-between">
                <span>{dataFormatada}</span>
                <span>{horaFormatada}</span>
              </div>
              <div className="text-gray-800 font-bold text-xl mb-3">
                {/* Mostra o nome da gestante (puxado pela relação do banco) */}
                {consulta.usuario?.nome || 'Paciente Desconhecida'} 
              </div>
              <div className="text-gray-600 mb-2 flex items-center font-medium">
                <span className="mr-2 text-xl">📍</span> {consulta.local}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${consulta.status === 'agendada' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {consulta.status.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {consultas.length === 0 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500 font-medium">
          Nenhuma consulta agendada. Clique no botão acima para marcar a primeira!
        </div>
      )}

      {/* Modal de Agendamento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Nova Consulta</h2>
            
            <form onSubmit={handleAgendar}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Paciente (Gestante)</label>
                <select 
                  required 
                  value={usuarioId} 
                  onChange={e => setUsuarioId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="" disabled>Selecione uma paciente</option>
                  {gestantes.map(g => (
                    <option key={g.id} value={g.id}>{g.nome}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Data</label>
                  <input type="date" required value={data} onChange={e => setData(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Hora</label>
                  <input type="time" required value={hora} onChange={e => setHora(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">Local da Consulta</label>
                <input type="text" required value={local} onChange={e => setLocal(e.target.value)} placeholder="Ex: UBS Central - Manaus" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded font-semibold transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
// frontend/src/views/gestante/FormGestante.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { criarUsuario, atualizarUsuario, buscarUsuario } from '../../services/usuarios.api';

const FormGestante: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    dataNascimento: '',
    semanasGestacao: '',
    nomeEmergencia: '',
    numeroEmergencia: '',
    historicoSaude: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      const carregarUsuario = async () => {
        try {
          setLoading(true);
          const usuario = await buscarUsuario(Number(id));
          setFormData({
            nome: usuario.nome || '',
            telefone: usuario.telefone || '',
            dataNascimento: usuario.dataNascimento ? usuario.dataNascimento.split('T')[0] : '',
            semanasGestacao: usuario.semanasGestacao?.toString() || '',
            nomeEmergencia: usuario.nomeEmergencia || '',
            numeroEmergencia: usuario.numeroEmergencia || '',
            historicoSaude: usuario.historicoSaude || ''
          });
        } catch (err) {
          setError('Erro ao carregar dados da gestante');
        } finally {
          setLoading(false);
        }
      };
      carregarUsuario();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nome.trim() || !formData.telefone.trim()) { 
      setError('Nome e Telefone são obrigatórios'); return; 
    }

    const payload = {
      nome: formData.nome,
      telefone: formData.telefone,
      dataNascimento: formData.dataNascimento ? new Date(`${formData.dataNascimento}T12:00:00`).toISOString() : null,
      semanasGestacao: formData.semanasGestacao ? parseInt(formData.semanasGestacao) : null,
      nomeEmergencia: formData.nomeEmergencia || null,
      numeroEmergencia: formData.numeroEmergencia || null,
      historicoSaude: formData.historicoSaude || null
    };

    try {
      setLoading(true);
      if (isEditing && id) await atualizarUsuario(Number(id), payload);
      else await criarUsuario(payload);
      
      navigate('/gestantes');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar gestante');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) return <div className="p-4 text-center">Carregando...</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">{isEditing ? '✏️ Editar Gestante' : '➕ Nova Gestante'}</h1>

        {error && <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4 font-medium">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold mb-1">Nome completo *</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-bold mb-1">Telefone (WhatsApp) *</label>
            <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} className="w-full px-3 py-2 border rounded" required />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Data de Nascimento</label>
            <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Semanas de Gestação</label>
            <input type="number" name="semanasGestacao" value={formData.semanasGestacao} onChange={handleChange} className="w-full px-3 py-2 border rounded" min="0" max="42" />
          </div>

          <div className="col-span-2 mt-2 border-t pt-4">
            <h3 className="font-bold text-gray-700 mb-3">Informações Clínicas e Emergência</h3>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Nome do Contato Emergência</label>
            <input type="text" name="nomeEmergencia" value={formData.nomeEmergencia} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Telefone da Emergência</label>
            <input type="tel" name="numeroEmergencia" value={formData.numeroEmergencia} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-bold mb-1">Histórico de Saúde (Comorbidades)</label>
            <textarea name="historicoSaude" value={formData.historicoSaude} onChange={handleChange} className="w-full px-3 py-2 border rounded h-20" placeholder="Ex: Pressão alta, diabetes gestacional..." />
          </div>

          <div className="col-span-2 flex gap-4 mt-4">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold">Salvar Cadastro</button>
            <button type="button" onClick={() => navigate('/gestantes')} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded font-bold">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormGestante;
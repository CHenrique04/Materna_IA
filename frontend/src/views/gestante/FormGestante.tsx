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
    dataUltimaMenstruacao: '',
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
            nome: usuario.nome,
            telefone: usuario.telefone,
            dataNascimento: usuario.dataNascimento ? usuario.dataNascimento.split('T')[0] : '',
            dataUltimaMenstruacao: usuario.dataUltimaMenstruacao ? usuario.dataUltimaMenstruacao.split('T')[0] : '',
          });
        } catch (err) {
          console.error(err);
          setError('Erro ao carregar dados da gestante');
        } finally {
          setLoading(false);
        }
      };
      carregarUsuario();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nome.trim()) { setError('Nome é obrigatório'); return; }
    if (!formData.telefone.trim()) { setError('Telefone é obrigatório'); return; }

    // PREPARAÇÃO DOS DADOS: Converte as datas para o padrão ISO exigido pelo banco
    const payload = {
      nome: formData.nome,
      telefone: formData.telefone,
      // Se o usuário preencheu a data, converte. Se deixou em branco, envia nulo para não quebrar o banco.
      dataNascimento: formData.dataNascimento ? new Date(`${formData.dataNascimento}T12:00:00`).toISOString() : null,
      dataUltimaMenstruacao: formData.dataUltimaMenstruacao ? new Date(`${formData.dataUltimaMenstruacao}T12:00:00`).toISOString() : null,
    };

    try {
      setLoading(true);
      if (isEditing && id) {
        // Envia o payload formatado em vez do formData cru
        await atualizarUsuario(Number(id), payload);
        alert('Gestante atualizada com sucesso!');
      } else {
        // Envia o payload formatado em vez do formData cru
        await criarUsuario(payload);
        alert('Gestante criada com sucesso!');
      }
      navigate('/gestantes');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409) {
        setError('Telefone já cadastrado no sistema');
      } else {
        const mensagemErro = err.response?.data?.error || 'Erro ao salvar gestante';
        setError(mensagemErro);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) return <div className="p-4 text-blue-600 font-medium text-center">Carregando dados...</div>;

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {isEditing ? '✏️ Editar Gestante' : '➕ Nova Gestante'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Nome completo *</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Ex: Maria da Silva"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Telefone (WhatsApp) *</label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="(11) 99999-1234"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Data de Nascimento</label>
            <input
              type="date"
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Data da Última Menstruação (DUM)</label>
            <input
              type="date"
              name="dataUltimaMenstruacao"
              value={formData.dataUltimaMenstruacao}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors font-semibold"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/gestantes')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormGestante;
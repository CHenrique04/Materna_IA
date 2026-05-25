import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { criarUsuario, atualizarUsuario, buscarUsuario } from '../../services/usuarios.api';
//import type { Usuario } from '../types/Usuario';

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

  // Carrega dados para edição
  useEffect(() => {
    if (isEditing && id) {
      const carregarUsuario = async () => {
        try {
          setLoading(true);
          const usuario = await buscarUsuario(Number(id));
          setFormData({
            nome: usuario.nome,
            telefone: usuario.telefone,
            dataNascimento: usuario.dataNascimento || '',
            dataUltimaMenstruacao: usuario.dataUltimaMenstruacao || '',
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

    // Validação simples
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    if (!formData.telefone.trim()) {
      setError('Telefone é obrigatório');
      return;
    }

    try {
      setLoading(true);
      if (isEditing && id) {
        await atualizarUsuario(Number(id), formData);
        alert('Gestante atualizada com sucesso!');
      } else {
        await criarUsuario(formData);
        alert('Gestante criada com sucesso!');
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409) {
        setError('Telefone já cadastrado');
      } else {
        setError('Erro ao salvar gestante');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="p-4">Carregando dados...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Editar Gestante' : 'Nova Gestante'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nome *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Telefone *
            </label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Data de Nascimento
            </label>
            <input
              type="date"
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Data da Última Menstruação
            </label>
            <input
              type="date"
              name="dataUltimaMenstruacao"
              value={formData.dataUltimaMenstruacao}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
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
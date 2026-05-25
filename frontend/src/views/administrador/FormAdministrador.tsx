import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Lembre-se de criar este arquivo de serviço com as funções do axios depois!
import { criarAdministrador, atualizarAdministrador, buscarAdministrador } from '../../services/administradores.api';

const FormAdministrador: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: '',
    municipio: '',
    senha: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega dados para edição
  useEffect(() => {
    if (isEditing && id) {
      const carregarAdmin = async () => {
        try {
          setLoading(true);
          const admin = await buscarAdministrador(Number(id));
          setFormData({
            nome: admin.nome,
            email: admin.email,
            cargo: admin.cargo,
            municipio: admin.municipio,
            senha: '', // A senha nunca volta do backend por segurança, deixamos em branco
          });
        } catch (err) {
          console.error(err);
          setError('Erro ao carregar dados do administrador');
        } finally {
          setLoading(false);
        }
      };
      carregarAdmin();
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação simples
    if (!formData.nome.trim()) { setError('Nome é obrigatório'); return; }
    if (!formData.email.trim()) { setError('E-mail é obrigatório'); return; }
    if (!formData.cargo.trim()) { setError('Cargo é obrigatório'); return; }
    if (!formData.municipio.trim()) { setError('Município é obrigatório'); return; }
    
    // A senha é obrigatória na criação, mas opcional na edição
    if (!isEditing && !formData.senha.trim()) {
      setError('Senha é obrigatória para novos administradores');
      return;
    }

    try {
      setLoading(true);
      if (isEditing && id) {
        await atualizarAdministrador(Number(id), formData);
        alert('Administrador atualizado com sucesso!');
      } else {
        await criarAdministrador(formData);
        alert('Administrador criado com sucesso!');
      }
      navigate('/administradores'); // Ajuste para a rota onde ficará a sua lista de ADMs
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 409) {
        setError('E-mail já cadastrado no sistema');
      } else {
        setError('Erro ao salvar administrador');
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
          {isEditing ? 'Editar Administrador' : 'Novo Administrador'}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Nome Completo *
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
              E-mail Institucional *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="exemplo@saude.gov.br"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Cargo *
            </label>
            <select
              name="cargo"
              value={formData.cargo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              <option value="" disabled>Selecione um cargo</option>
              <option value="ADMIN_GERAL">Administrador Geral</option>
              <option value="COORDENADOR">Coordenador</option>
              <option value="SECRETARIO">Secretário de Saúde</option>
              <option value="TECNICO">Técnico/Enfermeiro</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Município de Lotação *
            </label>
            <input
              type="text"
              name="municipio"
              value={formData.municipio}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Manaus"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Senha {isEditing ? '(Deixe em branco para manter a atual)' : '*'}
            </label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/administradores')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormAdministrador;
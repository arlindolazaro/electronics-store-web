import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Power, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import usuariosService, { type Usuario } from '../../services/usuarios.service';

const ListaUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('TODOS');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [usuarioParaDeletar, setUsuarioParaDeletar] = useState<number | null>(null);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setIsLoading(true);
      const dados = await usuariosService.listar();
      setUsuarios(dados);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await usuariosService.deletar(id);
      toast.success('Usuário deletado com sucesso!');
      carregarUsuarios();
      setUsuarioParaDeletar(null);
    } catch (error) {
      toast.error('Erro ao deletar usuário');
      console.error(error);
    }
  };

  const handleToggleStatus = async (usuario: Usuario) => {
    try {
      if (usuario.activo) {
        await usuariosService.desativar(usuario.id);
        toast.success('Usuário desativado!');
      } else {
        await usuariosService.ativar(usuario.id);
        toast.success('Usuário ativado!');
      }
      carregarUsuarios();
    } catch (error) {
      toast.error('Erro ao atualizar status do usuário');
      console.error(error);
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const roleMatch = filterRole === 'TODOS' || usuario.role === filterRole;
    const statusMatch = filterStatus === 'TODOS' || 
      (filterStatus === 'ACTIVO' && usuario.activo) || 
      (filterStatus === 'INATIVO' && !usuario.activo);
    return roleMatch && statusMatch;
  });

  const getRoleBadge = (role: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      'ADMIN': { bg: 'bg-red-100', text: 'text-red-800' },
      'GESTOR': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'VENDEDOR': { bg: 'bg-green-100', text: 'text-green-800' },
      'GERENTE_COMPRAS': { bg: 'bg-orange-100', text: 'text-orange-800' },
    };
    const cfg = config[role] || config['VENDEDOR'];
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.text}`}>
      {role.replace('_', ' ')}
    </span>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Usuários</h1>
        <button
          onClick={() => navigate('/usuarios/novo')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} /> Novo Usuário
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 flex gap-4 flex-wrap items-center">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Função</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="TODOS">Todas</option>
            <option value="ADMIN">Admin</option>
            <option value="GESTOR">Gestor</option>
            <option value="VENDEDOR">Vendedor</option>
            <option value="GERENTE_COMPRAS">Gerente de Compras</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="TODOS">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="INATIVO">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">Nenhum usuário encontrado</p>
          <button
            onClick={() => navigate('/usuarios/novo')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Criar primeiro usuário
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Função</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-900 font-medium">{usuario.nome}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{usuario.email}</td>
                  <td className="px-6 py-4">{getRoleBadge(usuario.role)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                      usuario.activo ? 'bg-green-600' : 'bg-gray-600'
                    }`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button
                      onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(usuario)}
                      className={`p-2 rounded-lg transition ${
                        usuario.activo ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={usuario.activo ? 'Desativar' : 'Ativar'}
                    >
                      <Power size={18} />
                    </button>
                    <button
                      onClick={() => setUsuarioParaDeletar(usuario.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Deletar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Confirmação de Delete */}
      {usuarioParaDeletar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirmar Exclusão</h2>
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setUsuarioParaDeletar(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(usuarioParaDeletar)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaUsuarios;

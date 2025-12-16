import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreVertical, Package } from 'lucide-react';
import produtosService from '../../services/produtos.service';
import type { Produto } from '../../services/produtos.service';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'sonner';

const ListaProdutos: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  useEffect(() => {
    fetchProdutos();
  }, []);

  // Escuta evento global para atualizações em tempo real de produtos
  useEffect(() => {
    const handler = () => fetchProdutos();
    window.addEventListener('produtos:updated', handler);
    return () => window.removeEventListener('produtos:updated', handler);
  }, []);

  const fetchProdutos = async () => {
    setIsLoading(true);
    try {
      const data = await produtosService.listar();
      setProdutos(data);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  };

  const exportProdutosCSV = () => {
    try {
      const rows = filteredProdutos.map(p => ({
        id: p.id ?? '',
        nome: p.nome ?? '',
        categoria: p.categoria ?? '',
        preco: (p.precoPadrao !== undefined && p.precoPadrao !== null) ? Number(p.precoPadrao) : 0,
        status: p.status ?? ''
      }));

      const header = ['id', 'nome', 'categoria', 'preco', 'status'];
      const csv = [header.join(',')].concat(rows.map(r => header.map(h => `"${(r as any)[h]}"`).join(','))).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'produtos.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Exportado produtos (CSV)');
    } catch (err) {
      console.error('Erro exportar CSV', err);
      toast.error('Erro ao exportar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await produtosService.deletar(id);
      // Recarrega a lista do servidor para garantir consistência
      await fetchProdutos();
      toast.success('Produto excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir produto', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const filteredProdutos = produtos.filter(produto => {
    const q = searchTerm.toLowerCase();
    const nome = produto.nome?.toString().toLowerCase() ?? '';
    const descricao = produto.descricao?.toString().toLowerCase() ?? '';
    const categoria = produto.categoria?.toString().toLowerCase() ?? '';

    const matchesSearch = nome.includes(q) || descricao.includes(q) || categoria.includes(q);

    const isActive = (p: Produto) => {
      const s = p.status?.toString().toLowerCase() ?? '';
      return s.includes('activo') || s.includes('active') || s === 'true';
    };

    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && isActive(produto)) ||
      (filterStatus === 'inactive' && !isActive(produto));

    // Exclude soft-deleted products (backend sets deletedAt or deleted_at)
    const isDeleted = (p: Produto) => Boolean((p as any).deletedAt || (p as any).deleted_at);

    return matchesSearch && matchesStatus && !isDeleted(produto);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9 py-2 text-sm"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter size={16} className="text-gray-400" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field pl-9 py-2 text-sm"
            >
              <option value="all">Todos os status</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          <div className="flex items-center justify-end md:justify-start gap-2">
            <button onClick={exportProdutosCSV} className="btn-secondary px-3 py-2 text-sm">Exportar</button>
            <button onClick={() => setShowAdvanced(prev => !prev)} className="btn-secondary px-3 py-2 text-sm">Filtros Avançados</button>
          </div>
        </div>

        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input placeholder="Categoria (filtro)" className="input-field text-sm" />
            <input placeholder="Preço mínimo" className="input-field text-sm" />
            <input placeholder="Preço máximo" className="input-field text-sm" />
          </div>
        )}
      </div>

      {/* Tabela de Produtos */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                // skeleton rows
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="ml-4">
                          <div className="h-4 bg-gray-200 rounded w-40 animate-pulse mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-60 animate-pulse"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"/></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28 animate-pulse"/></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"/></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"/></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-20 animate-pulse"/></td>
                  </tr>
                ))
              ) : (
                filteredProdutos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {produto.fotoBase64 ? (
                            <img src={produto.fotoBase64} alt={produto.nome} className="h-full w-full object-cover" />
                          ) : (
                            <Package size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{produto.descricao}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{produto.id ?? '-'}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{produto.categoria}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{formatCurrency(((produto.precoPadrao !== undefined && produto.precoPadrao !== null) ? Number(produto.precoPadrao) : 0))}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(produto.status ?? '').toString().toUpperCase() === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{(produto.status ?? '').toString().toUpperCase() === 'ACTIVO' ? 'Activo' : 'Inactivo'}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link to={`/produtos/${produto.id}`} className="text-primary-600 hover:text-primary-900 p-1" title="Visualizar"><Eye size={18} /></Link>
                        <Link to={`/produtos/${produto.id}/editar`} className="text-warning-600 hover:text-warning-900 p-1" title="Editar"><Edit size={18} /></Link>
                        <button onClick={() => handleDelete(produto.id!)} className="text-danger-600 hover:text-danger-900 p-1" title="Excluir"><Trash2 size={18} /></button>
                        <button className="text-gray-600 hover:text-gray-900 p-1"><MoreVertical size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!isLoading && filteredProdutos.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Package size={48} className="mx-auto" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Nenhum produto encontrado
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Tente alterar seus filtros de busca'
                : 'Comece adicionando seu primeiro produto'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <div className="mt-6">
                <Link
                  to="/produtos/novo"
                  className="btn-primary inline-flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  Adicionar Produto
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Paginação */}
        {filteredProdutos.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{filteredProdutos.length}</span> produtos
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Anterior
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default ListaProdutos;
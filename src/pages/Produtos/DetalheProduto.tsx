import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import produtosService from '../../services/produtos.service';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

interface ProdutoDetalhe {
  id: number;
  nome: string;
  descricao?: string;
  categoria: string;
  precoPadrao: number;
  status: string;
  fotoBase64?: string;
  createdBy?: string;
  dataEdicao?: string;
  dataCriacao?: string;
  updatedBy?: string;
  deletedBy?: string;
  deletedAt?: string;
}

const DetalheProduto: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [produto, setProduto] = useState<ProdutoDetalhe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const carregarProduto = async () => {
      if (!id || isNaN(Number(id))) {
        toast.error('ID do produto não encontrado');
        navigate('/produtos');
        return;
      }

      try {
        setIsLoading(true);
        const produtoId = parseInt(id, 10);
        const dados = await produtosService.obter(produtoId);
        if (dados && dados.id) {
          setProduto(dados as ProdutoDetalhe);
        } else {
          toast.error('Produto inválido');
          navigate('/produtos');
        }
      } catch (error) {
        toast.error('Erro ao carregar produto');
        console.error(error);
        navigate('/produtos');
      } finally {
        setIsLoading(false);
      }
    };

    carregarProduto();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!id || isNaN(Number(id))) return;

    try {
      setIsDeleting(true);
      const produtoId = parseInt(id, 10);
      await produtosService.deletar(produtoId);
      toast.success('Produto deletado com sucesso!');
      navigate('/produtos');
    } catch (error) {
      toast.error('Erro ao deletar produto');
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Produto não encontrado</p>
      </div>
    );
  }

  

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">{produto.nome}</h1>
      <div className="flex items-center gap-4 mb-6">
        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
          (produto.status ?? '').toString().toUpperCase() === 'ACTIVO' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {(produto.status ?? '').toString().toUpperCase() === 'ACTIVO' ? '✓ Activo' : '✕ Inactivo'}
        </span>
        <span className="text-gray-500 text-sm">ID: #{produto.id}</span>
      </div>

      {/* Conteúdo */}
      {produto.fotoBase64 && (
        <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex items-center justify-center rounded-lg mb-6 border border-gray-200">
          <div className="w-full max-w-sm">
            <img 
              src={produto.fotoBase64} 
              alt={produto.nome} 
              className="w-full h-auto object-contain max-h-56 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Categoria</p>
          <p className="text-gray-900 font-semibold">{produto.categoria}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Preço</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(produto.precoPadrao)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Criado por</p>
          <p className="text-gray-900 font-semibold">{produto.createdBy || 'Sistema'}</p>
        </div>
      </div>

      {produto.descricao && (
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Descrição</h3>
          <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{produto.descricao}</p>
        </div>
      )}

      {produto.dataCriacao && (
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Informações de Data</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
              <span className="text-gray-600 font-medium">Criado em:</span>
              <span className="text-gray-900 font-semibold">{formatDateTime(produto.dataCriacao)}</span>
            </div>
            {produto.dataEdicao && (
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
                <span className="text-gray-600 font-medium">Atualizado em:</span>
                <span className="text-gray-900 font-semibold">{formatDateTime(produto.dataEdicao)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/produtos/editar/${id}`)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition font-semibold flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md"
        >
          <Edit2 size={18} /> Editar
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition font-semibold flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md"
        >
          <Trash2 size={18} /> Deletar
        </button>
      </div>
      {/* Modal de Confirmação de Delete */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Confirmar Exclusão</h2>
            <p className="text-gray-700 mb-6 leading-relaxed text-sm">
              Tem certeza que deseja deletar o produto <strong className="text-red-600">{produto.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-medium text-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Deletando...
                  </>
                ) : (
                  'Deletar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalheProduto;

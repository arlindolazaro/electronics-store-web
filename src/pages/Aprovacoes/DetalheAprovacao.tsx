import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { aprovacaoService, type ApprovalTask } from '../../services/compras.service';
import comprasService, { type PedidoCompra } from '../../services/compras.service';
import { formatCurrency, safeMultiply } from '../../utils/formatters';

const DetalheAprovacao: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tarefa, setTarefa] = useState<ApprovalTask | null>(null);
  const [compra, setCompra] = useState<PedidoCompra | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    carregarDados();
  }, [id]);

  

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      if (!id) return;

      const tarefaData = await aprovacaoService.obter(Number(id));
      setTarefa(tarefaData);

      if (!tarefaData.pedidoCompraId) {
        toast.error('ID do pedido de compra não encontrado');
        return;
      }

      const compraData = await comprasService.obter(tarefaData.pedidoCompraId);
      setCompra(compraData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const aprovar = async () => {
    if (!tarefa?.id) return;
    try {
      setIsProcessing(true);
      await aprovacaoService.aprovar(tarefa.id);
      toast.success('Compra aprovada com sucesso!');
      navigate('/aprovacoes');
    } catch (error) {
      toast.error('Erro ao aprovar');
      console.error(error);
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  const rejeitar = async () => {
    if (!tarefa?.id || !justificativa.trim()) {
      toast.error('Forneça uma justificativa para rejeição');
      return;
    }
    try {
      setIsProcessing(true);
      await aprovacaoService.rejeitar(tarefa.id, justificativa);
      toast.success('Compra rejeitada com sucesso!');
      navigate('/aprovacoes');
    } catch (error) {
      toast.error('Erro ao rejeitar');
      console.error(error);
    } finally {
      setIsProcessing(false);
      setAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!tarefa || !compra) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/aprovacoes')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={32} />
          <p className="text-red-600">Dados não encontrados</p>
        </div>
      </div>
    );
  }

  if (tarefa.status !== 'PENDING') {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/aprovacoes')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <AlertCircle className="mb-2 text-blue-600" size={24} />
          <p className="text-blue-900 font-semibold">Esta solicitação já foi processada</p>
          <p className="text-blue-800 mt-2">Status: {tarefa.status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/aprovacoes')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <h1 className="text-2xl font-bold mb-6">Análise de Aprovação - Pedido #{compra.numeroCompra || compra.id}</h1>

      {/* Informações do Fornecedor */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Informações do Fornecedor</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nome</p>
            <p className="font-semibold text-gray-900">{compra.fornecedorNome}</p>
          </div>
          {compra.fornecedorEmail && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-semibold text-gray-900">{compra.fornecedorEmail}</p>
            </div>
          )}
        </div>
      </div>

      {/* Linhas de Compra */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Linhas de Compra</h2>
        {compra.linhas && compra.linhas.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Produto</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Qtd</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Preço Unit.</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {compra.linhas.map((linha, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm text-gray-900">#{linha.produtoId}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">{linha.quantidade}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-600">
                      {formatCurrency(linha.precoUnitario)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                      {formatCurrency(safeMultiply(linha.quantidade, linha.precoUnitario))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
        <div className="text-right">
          <p className="text-orange-600 text-sm mb-2">Total do Pedido</p>
          <p className="text-3xl font-bold text-orange-600">
            {formatCurrency(compra.total)}
          </p>
          <p className="text-xs text-orange-600 mt-2">Requer aprovação (&gt; 10.000 MZN)</p>
        </div>
      </div>

      {/* Formulário de Rejeição */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Justificativa (se Rejeitar)</h2>
        <textarea
          value={justificativa}
          onChange={(e) => setJustificativa(e.target.value)}
          placeholder="Descreva o motivo da rejeição..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          rows={4}
        />
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={() => navigate('/aprovacoes')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Voltar
        </button>

        <button
          onClick={() => setAction('reject')}
          disabled={isProcessing}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
        >
          {isProcessing && action === 'reject' && <Loader2 className="animate-spin" size={20} />}
          <X size={20} /> Rejeitar
        </button>

        <button
          onClick={() => setAction('approve')}
          disabled={isProcessing}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
        >
          {isProcessing && action === 'approve' && <Loader2 className="animate-spin" size={20} />}
          <Check size={20} /> Aprovar
        </button>
      </div>

      {/* Modal de Confirmação */}
      {action && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {action === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
            </h3>
            <p className="text-gray-600 mb-6">
              {action === 'approve' 
                ? 'Tem certeza que deseja aprovar este pedido?'
                : 'Tem certeza que deseja rejeitar este pedido?'
              }
            </p>
            {action === 'reject' && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800 font-semibold mb-2">Justificativa:</p>
                <p className="text-sm text-red-700 break-words">{justificativa || '(não fornecida)'}</p>
              </div>
            )}
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setAction(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={action === 'approve' ? aprovar : rejeitar}
                disabled={isProcessing}
                className={`px-4 py-2 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2 ${
                  action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isProcessing && <Loader2 className="animate-spin" size={16} />}
                {action === 'approve' ? 'Aprovar' : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetalheAprovacao;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { aprovacaoService } from '../../services/compras.service';

const AprovarCompra: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const aprovar = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      await aprovacaoService.aprovar(Number(id));
      toast.success('Compra aprovada com sucesso!');
      navigate('/aprovacoes');
    } catch (error) {
      toast.error('Erro ao aprovar compra');
      console.error(error);
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const rejeitar = async () => {
    if (!id || !justificativa.trim()) {
      toast.error('Forneça uma justificativa para rejeição');
      return;
    }
    try {
      setIsLoading(true);
      await aprovacaoService.rejeitar(Number(id), justificativa);
      toast.success('Compra rejeitada com sucesso!');
      navigate('/aprovacoes');
    } catch (error) {
      toast.error('Erro ao rejeitar compra');
      console.error(error);
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/aprovacoes')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <h1 className="text-2xl font-bold mb-6">Aprovar Solicitação #{id}</h1>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Justificativa (se Rejeitar)</h2>
          <textarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Descreva o motivo da rejeição..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            rows={5}
          />
        </div>

        <div className="flex gap-4 justify-end">
          <button
            onClick={() => navigate('/aprovacoes')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          
          <button
            onClick={() => setAction('reject')}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading && action === 'reject' && <Loader2 className="animate-spin" size={20} />}
            <X size={20} /> Rejeitar
          </button>

          <button
            onClick={() => setAction('approve')}
            disabled={isLoading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading && action === 'approve' && <Loader2 className="animate-spin" size={20} />}
            <Check size={20} /> Aprovar
          </button>
        </div>
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
                <p className="text-sm text-red-700">{justificativa || '(não fornecida)'}</p>
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
                disabled={isLoading}
                className={`px-4 py-2 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2 ${
                  action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isLoading && <Loader2 className="animate-spin" size={16} />}
                {action === 'approve' ? 'Aprovar' : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AprovarCompra;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { aprovacaoService, type ApprovalTask } from '../../services/compras.service';
import { formatDateTime } from '../../utils/formatters';

const ListaAprovacoes: React.FC = () => {
  const navigate = useNavigate();
  const [tarefas, setTarefas] = useState<ApprovalTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  useEffect(() => {
    carregarTarefas();
  }, []);

  const carregarTarefas = async () => {
    try {
      setIsLoading(true);
      const dados = await aprovacaoService.listar();
      setTarefas(dados);
    } catch (error) {
      toast.error('Erro ao carregar tarefas de aprovação');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTarefas = filterStatus === 'ALL' 
    ? tarefas 
    : tarefas.filter(t => t.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'PENDING': return 'Pendente';
      case 'APPROVED': return 'Aprovado';
      case 'REJECTED': return 'Rejeitado';
      default: return status;
    }
  };

  const pendingCount = tarefas.filter(t => t.status === 'PENDING').length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Aprovações de Compras</h1>
        {pendingCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <p className="text-red-700 font-semibold">
              {pendingCount} {pendingCount === 1 ? 'solicitação' : 'solicitações'} pendente(s)
            </p>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'ALL' ? 'Todas' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Lista de Tarefas */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : filteredTarefas.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600">
            {filterStatus === 'PENDING' 
              ? 'Nenhuma aprovação pendente' 
              : 'Nenhuma aprovação encontrada'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTarefas.map(tarefa => (
            <div 
              key={tarefa.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Pedido de Compra #{tarefa.pedidoCompraId}
                  </h3>
                  {tarefa.atualizadoEm && (
                    <p className="text-sm text-gray-500">{formatDateTime(tarefa.atualizadoEm)}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(tarefa.status)}`}>
                  {getStatusLabel(tarefa.status)}
                </span>
              </div>

              {tarefa.status === 'REJECTED' && tarefa.justificativaRejeicao && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                  <p className="text-red-800 text-sm font-semibold mb-1">Motivo da Rejeição:</p>
                  <p className="text-red-700 text-sm">{tarefa.justificativaRejeicao}</p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => navigate(`/compras/${tarefa.pedidoCompraId}`)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <Eye size={16} /> Ver Detalhes
                </button>

                {tarefa.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => navigate(`/aprovacoes/${tarefa.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                      <AlertCircle size={16} /> Analisar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaAprovacoes;

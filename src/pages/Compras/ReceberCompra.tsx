import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Package, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import comprasService, { type PedidoCompra } from '../../services/compras.service';
import { formatCurrency, safeMultiply } from '../../utils/formatters';

const ReceberCompra: React.FC = () => {
  const { id, lineIndex } = useParams<{ id: string; lineIndex: string }>();
  const navigate = useNavigate();
  const [compra, setCompra] = useState<PedidoCompra | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [quantidadeRecebida, setQuantidadeRecebida] = useState(0);
  const [notaFiscal, setNotaFiscal] = useState('');

  useEffect(() => {
    carregarCompra();
  }, [id]);

  

  const carregarCompra = async () => {
    try {
      setIsLoading(true);
      if (!id) return;
      const dados = await comprasService.obter(Number(id));
      setCompra(dados);
      
      // Pre-fill com quantidade pedida
      if (lineIndex && dados.linhas && dados.linhas[Number(lineIndex)]) {
        setQuantidadeRecebida(dados.linhas[Number(lineIndex)].quantidade);
      }
    } catch (error) {
      toast.error('Erro ao carregar compra');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const receberMercadoria = async () => {
    if (!compra?.id || !lineIndex) return;
    if (quantidadeRecebida <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }

    const linhaIndex = Number(lineIndex);
    const linha = compra.linhas?.[linhaIndex];
    if (!linha) {
      toast.error('Linha não encontrada');
      return;
    }

    if (quantidadeRecebida > linha.quantidade) {
      toast.error('Quantidade recebida não pode ser maior que pedida');
      return;
    }

    try {
      setIsSaving(true);
      await comprasService.receberMercadoria(compra.id, linha.id || linhaIndex, quantidadeRecebida);
      toast.success('Mercadoria recebida com sucesso!');
      navigate(`/compras/${compra.id}`);
    } catch (error) {
      toast.error('Erro ao receber mercadoria');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!compra || !lineIndex || !compra.linhas?.[Number(lineIndex)]) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate('/compras')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
        >
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-600" size={32} />
          <p className="text-red-600">Linha de compra não encontrada</p>
        </div>
      </div>
    );
  }

  const linha = compra.linhas[Number(lineIndex)];

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(`/compras/${id}`)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <h1 className="text-2xl font-bold mb-6">Receber Mercadoria - Compra #{compra.numeroCompra || id}</h1>

      {/* Informações da Linha */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Informações do Produto</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Produto ID</p>
            <p className="font-semibold text-gray-900">#{linha.produtoId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Quantidade Pedida</p>
            <p className="font-semibold text-gray-900">{linha.quantidade} unidades</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Preço Unitário</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(linha.precoUnitario)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total da Linha</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(safeMultiply(linha.quantidade, linha.precoUnitario))}
            </p>
          </div>
        </div>
      </div>

      {/* Formulário de Recebimento */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Registrar Recebimento</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quantidade Recebida *
          </label>
          <input
            type="number"
            min="0"
            max={linha.quantidade}
            value={quantidadeRecebida}
            onChange={(e) => setQuantidadeRecebida(Math.min(linha.quantidade, Number(e.target.value)))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Máximo: {linha.quantidade} unidades</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Número da Nota Fiscal (opcional)
          </label>
          <input
            type="text"
            value={notaFiscal}
            onChange={(e) => setNotaFiscal(e.target.value)}
            placeholder="Ex: NF-2025-001234"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Resumo */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 mb-2">Resumo do Recebimento:</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-blue-600">Quantidade Recebida</p>
              <p className="font-bold text-blue-900">{quantidadeRecebida} unidades</p>
            </div>
            <div>
              <p className="text-xs text-blue-600">Valor Total</p>
              <p className="font-bold text-blue-900">
                {formatCurrency(safeMultiply(quantidadeRecebida, linha.precoUnitario))}
              </p>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4 justify-end">
          <button
            onClick={() => navigate(`/compras/${id}`)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={receberMercadoria}
            disabled={isSaving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Salvando...
              </>
            ) : (
              <>
                <Package size={20} /> Confirmar Recebimento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceberCompra;

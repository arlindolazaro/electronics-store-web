import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import comprasService from '../../services/compras.service';
import produtosService, { type Produto } from '../../services/produtos.service';
import { formatCurrency, safeMultiply } from '../../utils/formatters';

const compraSchema = z.object({
  fornecedorNome: z.string().min(3, 'Nome do fornecedor deve ter pelo menos 3 caracteres'),
  fornecedorEmail: z.string().email('Email inválido').optional().or(z.literal('')),
});

type CompraFormData = z.infer<typeof compraSchema>;

interface LinhaCompraForm {
  produtoId: number;
  variacaoId: number;
  quantidade: number;
  precoUnitario: number;
  produtoNome?: string;
}

const CriarCompra: React.FC = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [linhas, setLinhas] = useState<LinhaCompraForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProdutoId, setSelectedProdutoId] = useState<number | ''>('');
  const [quantidade, setQuantidade] = useState(1);
  const [precoUnitario, setPrecoUnitario] = useState(0);

  const { control, handleSubmit, formState: { errors }, getValues, reset } = useForm<CompraFormData>({
    resolver: zodResolver(compraSchema),
    defaultValues: {
      fornecedorNome: '',
      fornecedorEmail: '',
    },
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  

  const carregarProdutos = async () => {
    try {
      setIsLoading(true);
      const dados = await produtosService.listar();
      setProdutos(dados);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const produtoSelecionado = produtos.find(p => p.id === selectedProdutoId);

  const adicionarLinha = () => {
    if (!selectedProdutoId || quantidade <= 0 || !precoUnitario || precoUnitario <= 0) {
      toast.error('Selecione produto, quantidade e preço válidos');
      return;
    }

    const novaLinha: LinhaCompraForm = {
      produtoId: Number(selectedProdutoId),
      variacaoId: 1,
      quantidade,
      precoUnitario,
      produtoNome: produtoSelecionado?.nome,
    };

    setLinhas(prev => [...prev, novaLinha]);
    
    // Reset campos
    setSelectedProdutoId('');
    setQuantidade(1);
    setPrecoUnitario(0);
    toast.success('Linha adicionada ao pedido');
  };

  const removerLinha = (index: number) => {
    setLinhas(linhas.filter((_, i) => i !== index));
  };

  const total = linhas.reduce((sum, linha) => sum + (linha.quantidade * linha.precoUnitario), 0);

  const onSubmit = async (data: CompraFormData) => {
    if (linhas.length === 0) {
      toast.error('Adicione pelo menos uma linha ao pedido');
      return;
    }

    try {
      setIsSaving(true);
      const linhasComTotal = linhas.map(linha => ({
        ...linha,
        total: linha.quantidade * linha.precoUnitario,
      }));
      const novaPedido = await comprasService.criar({
        fornecedorNome: data.fornecedorNome,
        fornecedorEmail: data.fornecedorEmail || undefined,
        status: 'DRAFT',
        total,
        linhas: linhasComTotal,
        data: new Date()
      });

      toast.success('Pedido de compra criado com sucesso!');
      navigate(`/compras/${novaPedido.id}`);
    } catch (error) {
      toast.error('Erro ao criar pedido');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/compras')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <h1 className="text-2xl font-bold mb-6">Criar Novo Pedido de Compra</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Dados do Fornecedor */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Informações do Fornecedor</h2>
          
          <Controller
            name="fornecedorNome"
            control={control}
            render={({ field }) => (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Fornecedor *</label>
                <input
                  {...field}
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.fornecedorNome ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Nome do fornecedor"
                />
                {errors.fornecedorNome && <p className="text-red-600 text-sm mt-1">{errors.fornecedorNome.message}</p>}
              </div>
            )}
          />

          <Controller
            name="fornecedorEmail"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  {...field}
                  type="email"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.fornecedorEmail ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="email@fornecedor.com"
                />
                {errors.fornecedorEmail && <p className="text-red-600 text-sm mt-1">{errors.fornecedorEmail.message}</p>}
              </div>
            )}
          />
        </div>

        {/* Seleção de Produtos */}
        {!isLoading && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Adicionar Linhas de Compra</h2>
            
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Produto</label>
                <select
                  value={selectedProdutoId}
                  onChange={(e) => {
                    setSelectedProdutoId(e.target.value ? Number(e.target.value) : '');
                    setPrecoUnitario(0);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preço Unit.</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={precoUnitario}
                  onChange={(e) => setPrecoUnitario(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div className="col-span-2 flex items-end">
                <button
                  type="button"
                  onClick={adicionarLinha}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Adicionar
                </button>
              </div>
            </div>

            {produtoSelecionado && produtoSelecionado.precoPadrao !== undefined && (
              <div className="text-sm text-gray-600 mb-4">
                Preço padrão: {formatCurrency(typeof produtoSelecionado.precoPadrao === 'number' ? produtoSelecionado.precoPadrao : Number(produtoSelecionado.precoPadrao) || 0)}
              </div>
            )}
          </div>
        )}

        {/* Linhas de Compra */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Linhas do Pedido {linhas.length > 0 && <span className="text-blue-600">({linhas.length})</span>}
          </h2>
          
          {linhas.length === 0 ? (
            <div className="text-center py-10 text-gray-500 border-2 border-dashed rounded-lg bg-gray-50">
              <p className="font-medium">Nenhuma linha adicionada ainda</p>
              <p className="text-sm">Adicione produtos acima para continuar</p>
            </div>
          ) : (
            <>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Produto</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Quantidade</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Preço Unit.</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.map((linha, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900">{linha.produtoNome || `Produto ${linha.produtoId}`}</td>
                        <td className="px-6 py-4 text-center text-sm text-gray-600">{linha.quantidade}</td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600">
                          {formatCurrency(linha.precoUnitario)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                          {formatCurrency(safeMultiply(linha.quantidade, linha.precoUnitario))}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => removerLinha(index)}
                            className="text-red-600 hover:text-red-700 transition"
                            title="Remover linha"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="text-right">
                  <p className="text-gray-600 text-sm mb-2">Total do Pedido:</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(total)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/compras')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Salvando...
              </>
            ) : (
              'Criar Pedido'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CriarCompra;

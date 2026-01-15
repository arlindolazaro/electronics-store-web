import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import vendasService from '../../services/vendas.service';
import produtosService from '../../services/produtos.service';
import type { Produto } from '../../services/produtos.service';
import { formatCurrency, safeMultiply } from '../../utils/formatters';

const vendaSchema = z.object({
  clienteNome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  clienteEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  clienteTelefone: z.string().optional().or(z.literal('')),
});

type VendaFormData = z.infer<typeof vendaSchema>;

interface VendaItemForm {
  produtoId: number;
  variacaoId: number;
  quantidade: number;
  precoUnitario: number;
  produtoNome?: string;
}

const CriarVenda: React.FC = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [items, setItems] = useState<VendaItemForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProdutoId, setSelectedProdutoId] = useState<number | ''>('');
  const [quantidade, setQuantidade] = useState(1);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VendaFormData>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      clienteNome: '',
      clienteEmail: '',
      clienteTelefone: '',
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
    } finally {
      setIsLoading(false);
    }
  };

  const produtoSelecionado = produtos.find(p => p.id === selectedProdutoId);
  const precoUnitario = Number(produtoSelecionado?.precoPadrao || 0);

  const adicionarItem = () => {
    if (!selectedProdutoId || quantidade <= 0) {
      toast.error('Selecione produto e quantidade válida');
      return;
    }

    const novoItem = {
      produtoId: Number(selectedProdutoId),
      variacaoId: 0,
      quantidade,
      precoUnitario,
      produtoNome: produtoSelecionado?.nome,
    };

    setItems(prev => [...prev, novoItem]);
    
    // Reset campos
    setSelectedProdutoId('');
    setQuantidade(1);
    toast.success('Item adicionado com sucesso');
  };

  const removerItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce(
    (sum, item) => sum + item.quantidade * item.precoUnitario,
    0
  );

  const onSubmit = async (data: VendaFormData) => {
    if (items.length === 0) {
      toast.error('Adicione pelo menos um item');
      return;
    }

    try {
      setIsSaving(true);
      const novaVenda = await vendasService.criar({
        data: new Date(),
        clienteNome: data.clienteNome,
        clienteEmail: data.clienteEmail || undefined,
        clienteTelefone: data.clienteTelefone || undefined,
        status: 'DRAFT',
        total,
        itens: items.map(item => ({
          ...item,
          total: item.quantidade * item.precoUnitario,
        })),
      });

      toast.success('Venda criada com sucesso!');
      navigate(`/vendas/${novaVenda.id}`);
    } catch (error) {
      toast.error('Erro ao criar venda');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5">
      <button
        onClick={() => navigate('/vendas')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-5"
      >
        <ArrowLeft size={18} /> Voltar
      </button>

      <h1 className="text-2xl font-bold mb-5">Criar Nova Venda</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Cliente */}
        <div className="bg-white border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Cliente</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Controller
              name="clienteNome"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="label">Nome *</label>
                  <input
                    {...field}
                    className={`input ${errors.clienteNome && 'input-error'}`}
                    placeholder="Nome do cliente"
                  />
                  {errors.clienteNome && (
                    <p className="error">{errors.clienteNome.message}</p>
                  )}
                </div>
              )}
            />

            <Controller
              name="clienteEmail"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="label">Email</label>
                  <input
                    {...field}
                    type="email"
                    className={`input ${errors.clienteEmail && 'input-error'}`}
                    placeholder="email@exemplo.com"
                  />
                </div>
              )}
            />

            <Controller
              name="clienteTelefone"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="label">Telefone</label>
                  <input
                    {...field}
                    type="tel"
                    className="input"
                    placeholder="(+258) 84 1234567"
                  />
                </div>
              )}
            />
          </div>
          <p className="mt-3 text-sm text-gray-500">Nota: actualmente os dados do cliente podem não ser persistidos pelo backend; confira o detalhe da venda após a criação para verificar quais informações foram salvas.</p>
        </div>

        {/* Produtos */}
        {!isLoading && (
          <div className="bg-white border rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-4">Adicionar Produtos</h2>

            <div className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-6">
                <label className="label">Produto</label>
                <select
                  value={selectedProdutoId}
                  onChange={e =>
                    setSelectedProdutoId(
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                  className="input"
                >
                  <option value="">Selecione</option>
                  {produtos
                    .filter(p =>
                      ['ACTIVO', 'ACTIVE', 'TRUE'].includes(
                        String(p.status).toUpperCase()
                      )
                    )
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                </select>
              </div>

              <div className="col-span-3">
                <label className="label">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={e =>
                    setQuantidade(Math.max(1, Number(e.target.value)))
                  }
                  className="input"
                />
              </div>

              <div className="col-span-3">
                <button
                  type="button"
                  onClick={adicionarItem}
                  className="w-full bg-green-600 text-white px-4 py-2.5 rounded-md flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Adicionar
                </button>
              </div>
            </div>

            {produtoSelecionado && (
              <p className="text-sm text-gray-600 mt-3">
                Preço unitário:{' '}
                <strong>{formatCurrency(produtoSelecionado.precoPadrao)}</strong>
              </p>
            )}
          </div>
        )}

        {/* Itens */}
        <div className="bg-white border rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">
            Itens da Venda {items.length > 0 && <span className="text-blue-600">({items.length})</span>}
          </h2>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
              <p>Nenhum item adicionado ainda</p>
              <p className="text-sm">Adicione produtos acima para continuar</p>
            </div>
          ) : (
            <>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="th text-left">Produto</th>
                    <th className="th text-center">Quantidade</th>
                    <th className="th text-right">Preço Unit.</th>
                    <th className="th text-right">Total</th>
                    <th className="th text-center">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 transition">
                      <td className="td py-3">{item.produtoNome || `Produto ${item.produtoId}`}</td>
                      <td className="td text-center py-3">{item.quantidade}</td>
                      <td className="td text-right py-3">
                        {formatCurrency(item.precoUnitario)}
                      </td>
                      <td className="td text-right py-3 font-semibold">
                        {formatCurrency(safeMultiply(item.quantidade, item.precoUnitario))}
                      </td>
                      <td className="td text-center py-3">
                        <button
                          type="button"
                          onClick={() => removerItem(index)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Remover item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 flex justify-end">
                <div className="text-right">
                  <p className="text-gray-600 text-sm mb-2">Total da Venda:</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(total)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-3 border-t">
          <button
            type="button"
            onClick={() => navigate('/vendas')}
            className="px-5 py-2.5 border rounded-md"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-md flex items-center gap-2 disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando…
              </>
            ) : (
              'Criar Venda'
            )}
          </button>
        </div>
      </form>

      <style>{`
        .label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 5px;
          color: #374151;
        }
        .input {
          width: 100%;
          padding: 9px 12px;
          border-radius: 9px;
          border: 1.5px solid #d1d5db;
          font-size: 14px;
        }
        .input-error {
          border-color: #ef4444;
          background: #fef2f2;
        }
        .error {
          font-size: 11px;
          margin-top: 4px;
          color: #dc2626;
        }
        .th {
          padding: 10px 12px;
          font-size: 13px;
          text-align: left;
        }
        .td {
          padding: 10px 12px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default CriarVenda;

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import produtosService from '../../services/produtos.service';

const produtoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  categoria: z.string().min(1, 'Selecione uma categoria'),
  precoPadrao: z.number().min(0, 'Preço deve ser maior que zero'),
  status: z.enum(['ACTIVO', 'INACTIVO', 'ARQUIVADO']),
});

type ProdutoFormData = z.infer<typeof produtoSchema>;

const EditarProduto: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
  });

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
        const produto = await produtosService.obter(produtoId);
        reset({
          nome: produto.nome,
          descricao: produto.descricao || '',
          categoria: produto.categoria,
          precoPadrao: Number(produto.precoPadrao),
          status: (produto.status ?? 'ACTIVO') as 'ACTIVO' | 'INACTIVO' | 'ARQUIVADO',
        });
      } catch (error) {
        toast.error('Erro ao carregar produto');
        console.error(error);
        navigate('/produtos');
      } finally {
        setIsLoading(false);
      }
    };

    carregarProduto();
  }, [id, navigate, reset]);

  const onSubmit = async (data: ProdutoFormData) => {
    if (!id || isNaN(Number(id))) return;

    try {
      setIsSaving(true);
      const produtoId = parseInt(id, 10);
      const payload: any = {
        nome: data.nome,
        descricao: data.descricao,
        categoria: data.categoria,
        precoPadrao: data.precoPadrao,
        status: data.status,
      };

      if (selectedImageBase64) payload.fotoBase64 = selectedImageBase64;

      await produtosService.atualizar(produtoId, payload);

      toast.success('Produto atualizado com sucesso!');
      navigate(`/produtos/${id}`);
    } catch (error) {
      toast.error('Erro ao atualizar produto');
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

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(`/produtos/${id}`)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <h1 className="text-2xl font-bold mb-6">Editar Produto</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
        <div className="space-y-4">
          <Controller
            name="nome"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Produto *</label>
                <input
                  {...field}
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.nome ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Ex: Lenovo ThinkPad X1 Carbon"
                />
                {errors.nome && <p className="text-red-600 text-sm mt-1">{errors.nome.message}</p>}
              </div>
            )}
          />

          <Controller
            name="descricao"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <textarea
                  {...field}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Descreva o produto..."
                  rows={4}
                />
              </div>
            )}
          />

          <Controller
            name="categoria"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria *</label>
                <select
                  {...field}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.categoria ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                  }`}
                >
                  <option value="">Selecione uma categoria</option>
                    <option value="Celulares">Celulares</option>
                    <option value="Computadores">Computadores</option>
                    <option value="Periféricos">Periféricos</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Áudio">Áudio</option>
                    <option value="Outros">Outros</option>
                </select>
                {errors.categoria && <p className="text-red-600 text-sm mt-1">{errors.categoria.message}</p>}
              </div>
            )}
          />

          <Controller
            name="precoPadrao"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preço Padrão (MZN) *</label>
                <input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === '' ? 0 : parseFloat(v));
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.precoPadrao ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="0.00"
                />
                {errors.precoPadrao && <p className="text-red-600 text-sm mt-1">{errors.precoPadrao.message}</p>}
              </div>
            )}
          />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Foto do Produto</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setSelectedImageBase64(String(reader.result));
                  };
                  reader.readAsDataURL(file);
                }}
              />
              {selectedImageBase64 && (
                <img src={selectedImageBase64} alt="Preview" className="mt-2 max-h-40" />
              )}
            </div>

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  {...field}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="ARQUIVADO">Arquivado</option>
                </select>
              </div>
            )}
          />
        </div>

        <div className="flex gap-4 justify-end mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`/produtos/${id}`)}
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
              <>
                <Save size={20} /> Atualizar Produto
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarProduto;

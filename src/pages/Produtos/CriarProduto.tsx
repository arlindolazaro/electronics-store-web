import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import produtosService from '../../services/produtos.service';

const produtoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  descricao: z.string().optional(),
  categoria: z.string().min(1, 'Selecione uma categoria'),
  precoPadrao: z.number().min(0, 'Preço deve ser maior que zero'),
  status: z.enum(['ACTIVO', 'INACTIVO']),
});

type ProdutoFormData = z.infer<typeof produtoSchema>;

const CriarProduto: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      categoria: '',
      precoPadrao: 0,
      status: 'ACTIVO',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setSelectedImageBase64(result);
      setPreviewImage(result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: ProdutoFormData) => {
    try {
      setIsSaving(true);

      const payload: any = {
        nome: data.nome,
        descricao: data.descricao || '',
        categoria: data.categoria,
        precoPadrao: data.precoPadrao,
        status: data.status,
      };

      if (selectedImageBase64) {
        payload.fotoBase64 = selectedImageBase64;
      }

      const novoProduto = await produtosService.criar(payload);
      toast.success('✓ Produto criado com sucesso!');
      navigate(`/produtos/${novoProduto.id}`);
    } catch (error) {
      toast.error('Erro ao criar produto');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Criar Produto
      </h1>
      <p className="text-sm text-gray-600 mb-5">
        Informe os dados principais do novo produto
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Imagem */}
          <div>
            <label className="label">Imagem</label>

            <div className="relative bg-gray-50 rounded-lg border border-dashed border-gray-300 p-4 text-center hover:border-blue-400 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />

              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-36 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setSelectedImageBase64(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="py-7">
                  <Upload className="mx-auto text-blue-600 mb-2" size={22} />
                  <p className="text-sm font-semibold text-gray-700">
                    Enviar imagem
                  </p>
                  <p className="text-xs text-gray-500">JPG ou PNG</p>
                </div>
              )}
            </div>
          </div>

          {/* Campos */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nome */}
            <Controller
              name="nome"
              control={control}
              render={({ field }) => (
                <div className="md:col-span-2">
                  <label className="label">Nome *</label>
                  <input
                    {...field}
                    className={`input ${errors.nome && 'input-error'}`}
                    placeholder="Ex: Lenovo ThinkPad"
                  />
                  {errors.nome && <p className="error">{errors.nome.message}</p>}
                </div>
              )}
            />

            {/* Categoria */}
            <Controller
              name="categoria"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="label">Categoria *</label>
                  <select
                    {...field}
                    className={`input ${errors.categoria && 'input-error'}`}
                  >
                    <option value="">Selecione</option>
                    <option value="Celulares">Celulares</option>
                    <option value="Computadores">Computadores</option>
                    <option value="Periféricos">Periféricos</option>
                    <option value="Acessórios">Acessórios</option>
                  </select>
                  {errors.categoria && (
                    <p className="error">{errors.categoria.message}</p>
                  )}
                </div>
              )}
            />

            {/* Preço */}
            <Controller
              name="precoPadrao"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="label">Preço (MZN) *</label>
                  <input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : 0
                      )
                    }
                    className={`input ${errors.precoPadrao && 'input-error'}`}
                    placeholder="0.00"
                  />
                  {errors.precoPadrao && (
                    <p className="error">{errors.precoPadrao.message}</p>
                  )}
                </div>
              )}
            />

            {/* Status */}
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="md:col-span-2">
                  <label className="label">Status *</label>
                  <div className="flex gap-6 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="radio" {...field} value="ACTIVO" />
                      Activo
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" {...field} value="INACTIVO" />
                      Inactivo
                    </label>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Descrição */}
        <Controller
          name="descricao"
          control={control}
          render={({ field }) => (
            <div>
              <label className="label">Descrição</label>
              <textarea
                {...field}
                rows={4}
                className="input resize-none"
                placeholder="Descrição do produto..."
              />
            </div>
          )}
        />

        {/* Ações */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/produtos')}
            className="px-5 py-2.5 text-sm border rounded-md"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 text-sm bg-blue-600 text-white rounded-md flex items-center gap-2 disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando…
              </>
            ) : (
              <>
                <Save size={16} />
                Criar
              </>
            )}
          </button>
        </div>
      </form>

      {/* Helpers */}
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
          outline: none;
        }
        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.15);
        }
        .input-error {
          border-color: #ef4444;
          background: #fef2f2;
        }
        .error {
          font-size: 11px;
          margin-top: 4px;
          color: #dc2626;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default CriarProduto;

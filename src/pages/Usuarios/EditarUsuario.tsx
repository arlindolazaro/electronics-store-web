import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import usuariosService from '../../services/usuarios.service';

const usuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.string().min(1, 'Selecione uma função'),
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

const EditarUsuario: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
  });

  useEffect(() => {
    const carregarUsuario = async () => {
      if (!id || isNaN(Number(id))) {
        toast.error('ID do usuário não encontrado');
        navigate('/usuarios');
        return;
      }

      try {
        setIsLoading(true);
        const usuarioId = parseInt(id, 10);
        const usuario = await usuariosService.obter(usuarioId);
        reset({
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role,
        });
      } catch (error) {
        toast.error('Erro ao carregar usuário');
        console.error(error);
        navigate('/usuarios');
      } finally {
        setIsLoading(false);
      }
    };

    carregarUsuario();
  }, [id, navigate, reset]);

  const onSubmit = async (data: UsuarioFormData) => {
    if (!id || isNaN(Number(id))) return;

    try {
      setIsSaving(true);
      const usuarioId = parseInt(id, 10);
      await usuariosService.atualizar(usuarioId, {
        nome: data.nome,
        email: data.email,
        role: data.role,
      });

      toast.success('Usuário atualizado com sucesso!');
      navigate('/usuarios');
    } catch (error) {
      toast.error('Erro ao atualizar usuário');
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
        onClick={() => navigate('/usuarios')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <h1 className="text-2xl font-bold mb-6">Editar Usuário</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
        <div className="space-y-4">
          <Controller
            name="nome"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo *</label>
                <input
                  {...field}
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.nome ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Ex: João Silva"
                />
                {errors.nome && <p className="text-red-600 text-sm mt-1">{errors.nome.message}</p>}
              </div>
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                <input
                  {...field}
                  type="email"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="joao@example.com"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
              </div>
            )}
          />

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Função *</label>
                <select
                  {...field}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                    errors.role ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                  }`}
                >
                  <option value="">Selecione uma função</option>
                  <option value="ADMIN">Admin</option>
                  <option value="GESTOR">Gestor</option>
                  <option value="VENDEDOR">Vendedor</option>
                  <option value="GERENTE_COMPRAS">Gerente de Compras</option>
                </select>
                {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>}
              </div>
            )}
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> Para alterar a senha do usuário, use a página de perfil do próprio usuário.
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-end mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
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
                <Save size={20} /> Atualizar Usuário
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditarUsuario;

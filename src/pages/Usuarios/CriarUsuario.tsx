import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import usuariosService from '../../services/usuarios.service';

const usuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string(),
  role: z.string().min(1, 'Selecione uma função'),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não conferem',
  path: ['confirmarSenha'],
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

const CriarUsuario: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      role: '',
    },
  });

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      setIsSaving(true);
      await usuariosService.criar({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        role: data.role,
      });

      toast.success('Usuário criado com sucesso!');
      navigate('/usuarios');
    } catch (error) {
      toast.error('Erro ao criar usuário');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/usuarios')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <h1 className="text-2xl font-bold mb-6">Criar Novo Usuário</h1>

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

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="senha"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Senha *</label>
                  <input
                    {...field}
                    type="password"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                      errors.senha ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="••••••"
                  />
                  {errors.senha && <p className="text-red-600 text-sm mt-1">{errors.senha.message}</p>}
                </div>
              )}
            />

            <Controller
              name="confirmarSenha"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Senha *</label>
                  <input
                    {...field}
                    type="password"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                      errors.confirmarSenha ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="••••••"
                  />
                  {errors.confirmarSenha && <p className="text-red-600 text-sm mt-1">{errors.confirmarSenha.message}</p>}
                </div>
              )}
            />
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
                <Loader2 className="animate-spin" size={20} /> Criando...
              </>
            ) : (
              <>
                <Save size={20} /> Criar Usuário
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CriarUsuario;

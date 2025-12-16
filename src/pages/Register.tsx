import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  passwordConfirm: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'As senhas não coincidem',
  path: ['passwordConfirm'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    const registerData = {
      name: data.name,
      email: data.email,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
    };
    try {
      await registerUser(registerData);
      toast.success('Conta criada com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      const resp = error.response?.data;
      if (resp?.errors && typeof resp.errors === 'object') {
        Object.entries(resp.errors).forEach(([key, val]) => {
          const message = Array.isArray(val) ? val.join(' ') : String(val);
          if (key === 'name') setError('name', { type: 'server', message });
          if (key === 'email') setError('email', { type: 'server', message });
          if (key === 'password') setError('password', { type: 'server', message });
        });
      } else {
        toast.error(resp?.message || 'Erro ao registrar');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Criar conta</h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Registre-se no Mundo Store
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome */}
        <div>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input {...register('name')} className="input-field pl-10" placeholder="Nome" />
          </div>
          {errors.name && <p className="error">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input {...register('email')} className="input-field pl-10" placeholder="Email" />
          </div>
          {errors.email && <p className="error">{errors.email.message}</p>}
        </div>

          {/* Senha */}
          <div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="input-field pl-10 pr-10"
                placeholder="Senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="error">{errors.password.message}</p>}
          </div>

          {/* Confirmar Senha */}
          <div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('passwordConfirm')}
                type={showPassword ? 'text' : 'password'}
                className="input-field pl-10"
                placeholder="Confirmar senha"
              />
            </div>
            {errors.passwordConfirm && (
              <p className="error">{errors.passwordConfirm.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

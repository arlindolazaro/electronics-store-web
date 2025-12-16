import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Save, LogOut, Loader2, Sun, Moon, Monitor, Bell, Shield, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import useAuthStore from '../store/authStore';
import authService from '../services/auth.service';
import vendasService from '../services/vendas.service';
import comprasService from '../services/compras.service';
import produtosService from '../services/produtos.service';

const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
});

const passwordSchema = z.object({
  senhaAtual: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  novaSenha: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
  confirmarSenha: z.string().min(6, 'Confirmação deve ter no mínimo 6 caracteres'),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});


type ProfileFormData = z.infer<typeof profileSchema>;

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en';
  notificationsSales: boolean;
  notificationsLowStock: boolean;
  notificationsDailySummary: boolean;
}

const Perfil: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({ vendasCount: 0, comprasCount: 0, produtosCount: 0, totalVendas: 0 });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'pt',
    notificationsSales: true,
    notificationsLowStock: true,
    notificationsDailySummary: false,
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  type PasswordFormData = z.infer<typeof passwordSchema>;
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: '',
    },
  });

  useEffect(() => {
    // Load avatar from user store if available
    if ((user as any)?.avatar || (user as any)?.avatarUrl || (user as any)?.image || (user as any)?.photo) {
      const avatarSrc = (user as any).avatar || (user as any).avatarUrl || (user as any).image || (user as any).photo;
      setAvatarPreview(avatarSrc);
      setAvatarBase64(avatarSrc);
      if (user?.id) {
        localStorage.setItem(`avatar_${user.id}`, avatarSrc);
      }
    } else if (user?.id) {
      const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
      if (savedAvatar) {
        setAvatarPreview(savedAvatar);
        setAvatarBase64(savedAvatar);
        const updatedUser: any = { ...(user || {}), avatar: savedAvatar };
        setUser(updatedUser);
      }
    }

    // Load preferences
    if (user?.id) {
      const savedPrefs = localStorage.getItem(`preferences_${user.id}`);
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs));
        } catch (e) {
          console.error('Erro ao carregar preferências', e);
        }
      }
    }
  }, [user?.id, user]);

  useEffect(() => {
    const carregarStats = async () => {
      try {
        const [vendas, compras, produtos] = await Promise.all([
          vendasService.listar(),
          comprasService.listar(),
          produtosService.listar(),
        ]);

        const vendasArray = Array.isArray(vendas) ? vendas : [];
        const comprasArray = Array.isArray(compras) ? compras : [];
        const produtosArray = Array.isArray(produtos) ? produtos : [];

        const totalVendas = vendasArray.reduce((s: number, v: any) => s + (Number(v.total) || 0), 0);

        setStats({
          vendasCount: vendasArray.length,
          comprasCount: comprasArray.length,
          produtosCount: produtosArray.length,
          totalVendas,
        });
      } catch (err) {
        // não bloquear perfil se falhar
        console.error('Erro ao carregar stats do perfil', err);
      }
    };

    carregarStats();
  }, []);


  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      const payload: any = { ...data };
      if (avatarBase64) {
        payload.avatarBase64 = avatarBase64;
      } else if (!avatarPreview) {
        // If avatar was removed, send explicit null to backend
        payload.avatarBase64 = null;
      }
      const updatedUser = await authService.updateProfile(payload);
      // If backend doesn't return an avatar field, merge local preview so navbar shows image immediately
      const mergedUser: any = { ...(user || {}), ...updatedUser };
      if (!(mergedUser.avatar || mergedUser.avatarUrl || mergedUser.image || mergedUser.photo) && avatarBase64) {
        mergedUser.avatar = avatarBase64;
      } else if (!avatarPreview) {
        // Clear avatar fields if removed
        mergedUser.avatar = null;
        mergedUser.avatarUrl = null;
        mergedUser.image = null;
        mergedUser.photo = null;
      }
      setUser(mergedUser);
      // Persist avatar locally so it survives logout/login
      if (avatarBase64 && user?.id) {
        localStorage.setItem(`avatar_${user.id}`, avatarBase64);
      } else if (!avatarPreview && user?.id) {
        localStorage.removeItem(`avatar_${user.id}`);
      }
      toast.success('Perfil atualizado com sucesso!');
      setIsEditingProfile(false);
    } catch (error: any) {
      const resp = error.response?.data;
      if (resp?.errors && typeof resp.errors === 'object') {
        // map backend field errors to form
        Object.entries(resp.errors).forEach(([key, val]) => {
          const message = Array.isArray(val) ? val.join(' ') : String(val);
          // map potential backend names to form field names
          if (key === 'name' || key === 'email') {
            profileForm.setError(key as any, { type: 'server', message });
          }
        });
      } else {
        toast.error(resp?.message || 'Erro ao atualizar perfil');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setIsSaving(true);
      await authService.changePassword({ 
        currentPassword: data.senhaAtual, 
        newPassword: data.novaSenha 
      });
      toast.success('Senha alterada com sucesso!');
      setIsEditingPassword(false);
      passwordForm.reset();
    } catch (error: any) {
      const resp = error.response?.data;
      if (resp?.errors && typeof resp.errors === 'object') {
        Object.entries(resp.errors).forEach(([key, val]) => {
          const message = Array.isArray(val) ? val.join(' ') : String(val);
          if (key === 'senhaAtual' || key === 'novaSenha' || key === 'confirmarSenha') {
            passwordForm.setError(key as any, { type: 'server', message });
          }
        });
      } else {
        toast.error(resp?.message || 'Erro ao alterar senha');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Desconectado com sucesso');
  };

  const handleAvatarChange = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      // remove data:*/*;base64, prefix when sending? Keep full dataURI for backend convenience
      setAvatarBase64(result);
      // update store immediately so Navbar and other components reflect the new avatar before saving to backend
      try {
        const mergedUser: any = { ...(user || {}), avatar: result };
        setUser(mergedUser);
      } catch (e) {
        // ignore
      }
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleAvatarChange(f);
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    if (user?.id) {
      localStorage.setItem(`preferences_${user.id}`, JSON.stringify(updated));
    }
    toast.success('Preferência atualizada');
  };

  const userPermissions = [
    'Visualizar Dashboard',
    'Gerir Vendas',
    'Gerir Compras',
    'Gerir Inventário',
    'Gerar Relatórios',
    'Visualizar Aprovações',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-3 overflow-hidden">
      {/* CONTAINER ÚNICO COM SCROLL - contém ESQUERDA E DIREITA */}
      <div className="flex gap-3 h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Coluna Esquerda - Perfil e Estatísticas */}
        <div className="w-72 flex-shrink-0">
          {/* Cabeçalho */}
          <div className="pt-1 mb-4 sticky top-0 bg-gradient-to-b from-gray-50 via-gray-50 to-transparent pb-2 z-10">
            <h1 className="text-xl font-bold text-gray-900 mb-0.5">Meu Perfil</h1>
            <p className="text-xs text-gray-500">Gerencie sua conta</p>
          </div>

          {/* Card Avatar e Informações */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow mb-4">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden mb-3 shadow-lg">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-white" size={40} />
                )}
              </div>

              <h2 className="text-base font-bold text-gray-900 text-center">{user?.name}</h2>
              <p className="text-xs text-gray-500 mt-0.5 text-center">{user?.email}</p>

              <input id="avatarInput" type="file" accept="image/*" onChange={onFileInputChange} className="hidden" />
              <div className="mt-3 flex gap-2 w-full">
                <label htmlFor="avatarInput" className="flex-1 text-xs px-3 py-2 border border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer text-center font-medium transition">
                  Alterar
                </label>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarPreview(null);
                      setAvatarBase64(null);
                      const updatedUser: any = { ...(user || {}), avatar: null, avatarUrl: null, image: null, photo: null };
                      setUser(updatedUser);
                    }}
                    className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition"
                  >
                    Remover
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0"></div>
              <div>
                <p className="text-xs font-medium text-gray-500">Status</p>
                <p className="text-xs font-semibold text-gray-900">{user?.active !== false ? 'Ativo' : 'Inativo'}</p>
              </div>
            </div>
          </div>

          {/* Card Estatísticas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-900 mb-3">Atividade</h3>
            <div className="space-y-2">
              {[
                { label: 'Vendas', value: stats.vendasCount, icon: '📊' },
                { label: 'Compras', value: stats.comprasCount, icon: '🛒' },
                { label: 'Produtos', value: stats.produtosCount, icon: '📦' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <span className="text-lg">{stat.icon}</span>
                  <div className="flex-1 mx-3">
                    <p className="text-xs text-gray-500">{stat.label}</p>
                    <p className="font-bold text-sm text-gray-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {stats.totalVendas > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-0.5">Total Vendas</p>
                <p className="text-sm font-bold text-green-600">${stats.totalVendas.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Botão Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:from-red-600 hover:to-red-700 font-medium transition flex items-center justify-center gap-2 text-sm"
          >
            <LogOut size={16} /> Sair da Conta
          </button>
        </div>

        {/* Coluna Direita - Configurações e Preferências */}
        <div className="flex-1 min-w-0">
          {/* Grid de Configurações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Informações Pessoais */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-900">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-blue-600" />
                  </div>
                  Informações Pessoais
                </h2>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-0.5 hover:bg-blue-50 rounded-lg transition"
                >
                  {isEditingProfile ? 'Cancelar' : 'Editar'}
                </button>
              </div>

              {!isEditingProfile ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-0.5">Nome</p>
                    <p className="text-sm text-gray-900 font-semibold">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-0.5">Email</p>
                    <p className="text-sm text-gray-900 font-semibold">{user?.email}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-3">
                  {['name', 'email'].map((fieldName) => (
                    <Controller
                      key={fieldName}
                      name={fieldName as any}
                      control={profileForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <label className="text-xs font-semibold text-gray-700 mb-1 block">{fieldName === 'name' ? 'Nome' : 'Email'}</label>
                          <input
                            {...field}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
                              error ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-200'
                            }`}
                            placeholder={fieldName === 'name' ? 'Seu nome' : 'seu@email.com'}
                          />
                          {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
                        </div>
                      )}
                    />
                  ))}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition flex justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {isSaving ? 'Guardando...' : 'Guardar Alterações'}
                  </button>
                </form>
              )}
            </div>

            {/* Segurança */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-900">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Key size={16} className="text-amber-600" />
                  </div>
                  Segurança
                </h2>
                <button
                  onClick={() => setIsEditingPassword(!isEditingPassword)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-0.5 hover:bg-blue-50 rounded-lg transition"
                >
                  {isEditingPassword ? 'Cancelar' : 'Alterar'}
                </button>
              </div>

              {isEditingPassword ? (
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-3">
                  {['senhaAtual', 'novaSenha', 'confirmarSenha'].map((fieldName) => (
                    <Controller
                      key={fieldName}
                      name={fieldName as any}
                      control={passwordForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <div>
                          <label className="text-xs font-semibold text-gray-700 mb-1 block">{fieldName === 'senhaAtual' ? 'Senha Atual' : fieldName === 'novaSenha' ? 'Nova Senha' : 'Confirmar Nova Senha'}</label>
                          <input
                            {...field}
                            type="password"
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition ${
                              error ? 'border-red-300 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:ring-amber-200'
                            }`}
                            placeholder="••••••••"
                          />
                          {error && <p className="text-xs text-red-600 mt-1">{error.message}</p>}
                        </div>
                      )}
                    />
                  ))}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-2 text-sm bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:shadow-lg hover:from-amber-700 hover:to-amber-800 font-semibold transition flex justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {isSaving ? 'Atualizando...' : 'Atualizar Senha'}
                  </button>
                </form>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Mantenha sua conta segura com uma senha forte.</p>
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="w-full py-2 text-sm border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 font-medium transition mt-2"
                  >
                    Alterar Senha
                  </button>
                </div>
              )}
            </div>

            {/* Preferências */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-900 mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sun size={16} className="text-indigo-600" />
                </div>
                Preferências
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Tema</label>
                  <div className="flex gap-2">
                    {(['light', 'dark', 'system'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => handlePreferenceChange('theme', theme)}
                        className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-semibold rounded-lg border-2 transition ${
                          preferences.theme === theme
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-600'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-gray-50'
                        }`}
                      >
                        {theme === 'light' ? <Sun size={14} /> : theme === 'dark' ? <Moon size={14} /> : <Monitor size={14} />}
                        <span className="capitalize text-xs">{theme === 'system' ? 'Auto' : theme}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">Idioma</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                  >
                    <option value="pt">Português</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notificações */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-900 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell size={16} className="text-orange-600" />
                </div>
                Notificações
              </h2>
              <div className="space-y-3">
                {[
                  { key: 'notificationsSales' as const, label: 'Vendas', desc: 'Novas vendas' },
                  { key: 'notificationsLowStock' as const, label: 'Stock Baixo', desc: 'Stock crítico' },
                  { key: 'notificationsDailySummary' as const, label: 'Resumo Diário', desc: 'Relatório diário' },
                ].map((notif) => (
                  <label key={notif.key} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={preferences[notif.key]}
                      onChange={(e) => handlePreferenceChange(notif.key, e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-2 focus:ring-orange-200"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{notif.label}</p>
                      <p className="text-xs text-gray-500">{notif.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Permissões */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow lg:col-span-2">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-900 mb-4">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield size={16} className="text-pink-600" />
                </div>
                Permissões e Papéis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-100">
                  <p className="text-xs text-gray-500 font-medium mb-1">Seu Papel</p>
                  <p className="text-sm font-bold text-pink-600">{(user as any)?.role || 'Utilizador'}</p>
                  <p className="text-xs text-gray-500 mt-2">Este papel define as suas permissões no sistema.</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-900 mb-3">Permissões Ativas</p>
                  <div className="grid grid-cols-2 gap-2">
                    {userPermissions.map((perm, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                        <span className="text-xs text-gray-700 truncate">{perm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Espaço no final para scroll */}
          <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
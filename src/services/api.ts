import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Log da URL da API em dev para diagnóstico rápido
if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[api] API_URL =', API_URL);
}

// Request interceptor para adicionar token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor para tratar erros
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await axios.post(`${API_URL}/api/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefresh } = response.data;

                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefresh);

                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                // Limpar localStorage e redirecionar para login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');

                window.location.href = '/login';
                toast.error('Sessão expirada. Por favor, faça login novamente.');
                return Promise.reject(refreshError);
            }
        }

        // Tratar outros erros
        if (error.response?.status === 403) {
            toast.error('Acesso negado. Você não tem permissão para esta ação.');
        } else if (error.response?.status === 404) {
            toast.error('Recurso não encontrado.');
        } else if (error.response?.status === 500) {
            // Exibir mensagem genérica para o usuário e logar detalhes completos no console
            toast.error('Erro interno do servidor. Tente novamente mais tarde.');
            // eslint-disable-next-line no-console
            console.error('[api] Erro 500 response data:', error.response?.data);
            // eslint-disable-next-line no-console
            console.error('[api] Erro 500 response full:', error.response);
        } else if (error.response?.data?.message) {
            toast.error(error.response.data.message);
        }

        // Sempre logar o corpo da resposta em dev para facilitar debug
        if (import.meta.env.DEV && error.response) {
            // eslint-disable-next-line no-console
            console.debug('[api] response for failed request:', {
                url: originalRequest?.url,
                status: error.response.status,
                data: error.response.data,
            });
        }

        return Promise.reject(error);
    }
);

export default api;
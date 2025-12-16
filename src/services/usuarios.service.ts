import api from './api';

export interface Usuario {
    id: number;
    nome: string;
    email: string;
    role: 'ADMIN' | 'GESTOR' | 'VENDEDOR' | 'GERENTE_COMPRAS';
    activo: boolean;
    dataCriacao?: string;
    dataEdicao?: string;
}

export interface CreateUsuarioDTO {
    nome: string;
    email: string;
    senha: string;
    role: string;
}

export interface UpdateUsuarioDTO {
    nome: string;
    email: string;
    role: string;
}

class UsuariosService {
    async listar(): Promise<Usuario[]> {
        try {
            const response = await api.get('/api/users');
            return response.data || [];
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            return [];
        }
    }

    async obter(id: number): Promise<Usuario> {
        try {
            const response = await api.get(`/api/users/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao obter usuário ${id}:`, error);
            throw error;
        }
    }

    async criar(usuario: CreateUsuarioDTO): Promise<Usuario> {
        try {
            const response = await api.post('/api/users', usuario);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    }

    async atualizar(id: number, usuario: UpdateUsuarioDTO): Promise<Usuario> {
        try {
            const response = await api.put(`/api/users/${id}`, usuario);
            return response.data;
        } catch (error) {
            console.error(`Erro ao atualizar usuário ${id}:`, error);
            throw error;
        }
    }

    async deletar(id: number): Promise<void> {
        try {
            await api.delete(`/api/users/${id}`);
        } catch (error) {
            console.error(`Erro ao deletar usuário ${id}:`, error);
            throw error;
        }
    }

    async ativar(id: number): Promise<Usuario> {
        try {
            const response = await api.patch(`/api/users/${id}/activate`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao ativar usuário ${id}:`, error);
            throw error;
        }
    }

    async desativar(id: number): Promise<Usuario> {
        try {
            const response = await api.patch(`/api/users/${id}/deactivate`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao desativar usuário ${id}:`, error);
            throw error;
        }
    }
}

export default new UsuariosService();

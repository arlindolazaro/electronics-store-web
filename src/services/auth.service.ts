import api from './api';

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    displayName?: string;
    active?: boolean;
    roles?: string[];
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType?: string;
    expiresIn?: number;
    user: User;
}

class AuthService {
    async login(data: LoginData): Promise<AuthResponse> {
        const response = await api.post('/api/auth/login', data);
        return response.data;
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post('/api/auth/register', data);
        return response.data;
    }

    async getCurrentUser(): Promise<User> {
        const response = await api.get('/api/auth/me');
        return response.data;
    }

    async updateProfile(data: Partial<User>): Promise<User> {
        const response = await api.put('/api/auth/update-profile', data);
        return response.data;
    }

    async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
        await api.post('/api/auth/change-password', data);
    }

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        const response = await api.post('/api/auth/refresh', { refreshToken });
        return response.data;
    }

    logout(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    getToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    getUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    hasRole(role: string): boolean {
        const user = this.getUser();
        return user?.roles?.includes(role) ?? false;
    }
}

export default new AuthService();
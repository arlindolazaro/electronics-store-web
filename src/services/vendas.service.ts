import api from './api';

export interface Venda {
    id?: number;
    data: Date | string; // backend pode retornar string ISO
    clienteNome: string;
    clienteEmail?: string;
    clienteTelefone?: string;
    status: 'DRAFT' | 'CONFIRMED' | 'SHIPPED' | 'RESERVED' | 'PAID' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
    total: number;
    itens: VendaItem[];
}

export interface VendaItem {
    produtoId: number;
    variacaoId: number;
    quantidade: number;
    precoUnitario: number;
    total: number;
}

class VendasService {
    async listar(): Promise<Venda[]> {
        const response = await api.get('/api/sales');
        return response.data;
    }

    async obter(id: number): Promise<Venda> {
        const maxAttempts = 3;
        let attempt = 0;
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        while (attempt < maxAttempts) {
            try {
                const response = await api.get(`/api/sales/${id}`);
                return response.data;
            } catch (err) {
                attempt++;
                // @ts-ignore
                const status = err?.response?.status;
                // If server error (5xx) try again, otherwise rethrow
                if (status && status >= 500 && attempt < maxAttempts) {
                    // exponential backoff
                    const wait = 200 * Math.pow(2, attempt);
                    // eslint-disable-next-line no-console
                    console.warn(`[vendas.service] tentativa ${attempt} falhou (status ${status}), retry em ${wait}ms`);
                    // wait then retry
                    // @ts-ignore
                    await delay(wait);
                    continue;
                }
                // rethrow original error
                throw err;
            }
        }
        // If all attempts exhausted, throw a generic error
        throw new Error('Não foi possível obter a venda após múltiplas tentativas');
    }

    async criar(venda: Venda): Promise<Venda> {
        const response = await api.post('/api/sales', venda);
        return response.data;
    }

    async confirmar(id: number, location: string = 'default', username: string = 'system'): Promise<Venda> {
        const response = await api.post(`/api/sales/${id}/confirm`, null, {
            params: { location, username }
        });
        return response.data;
    }

    async marcarEnviada(id: number, location: string = 'default', username: string = 'system'): Promise<Venda> {
        const response = await api.post(`/api/sales/${id}/ship`, null, {
            params: { location, username }
        });
        return response.data;
    }
}

export default new VendasService();
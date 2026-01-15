import api from './api';

export interface Venda {
    id?: number;
    data: Date | string;
    clienteNome: string;
    clienteEmail?: string;
    clienteTelefone?: string;
    status: 'DRAFT' | 'CONFIRMED' | 'SHIPPED' | 'RESERVED' | 'PAID' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
    total: number;
    itens: VendaItem[];
    createdBy?: string;
    createdAt?: string;
}

export interface VendaItem {
    produtoId: number;
    produtoNome?: string;
    variacaoId: number;
    variacaoSku?: string;
    quantidade: number;
    precoUnitario: number;
    total: number;
}

class VendasService {
    async listar(): Promise<Venda[]> {
        try {
            const response = await api.get('/api/sales');
            return response.data || [];
        } catch (err) {
            console.error('[vendas.service] erro ao listar vendas:', err);
            throw err;
        }
    }

    async obter(id: number): Promise<Venda> {
        try {
            const response = await api.get(`/api/sales/${id}`);

            // Normalize response data to match interface
            const data = response.data;
            return {
                id: data.id,
                data: data.createdAt || data.data,
                clienteNome: data.clienteNome,
                clienteEmail: data.clienteEmail,
                clienteTelefone: data.clienteTelefone,
                status: this.normalizeStatus(data.status),
                total: Number(data.total) || 0,
                itens: (data.itens || []).map(item => ({
                    produtoId: item.produtoId,
                    produtoNome: item.produtoNome,
                    variacaoId: item.variacaoId,
                    variacaoSku: item.variacaoSku,
                    quantidade: Number(item.quantidade),
                    precoUnitario: Number(item.precoUnitario),
                    total: Number(item.total),
                })),
                createdBy: data.createdBy,
                createdAt: data.createdAt,
            };
        } catch (err) {
            console.error('[vendas.service] erro ao obter venda:', err);
            throw err;
        }
    }

    private normalizeStatus(status: string): Venda['status'] {
        const mapping: Record<string, Venda['status']> = {
            'DRAFT': 'DRAFT',
            'CONFIRMED': 'CONFIRMED',
            'RESERVED': 'RESERVED',
            'PAID': 'PAID',
            'SHIPPED': 'SHIPPED',
            'DELIVERED': 'DELIVERED',
            'CANCELLED': 'CANCELLED',
            'RETURNED': 'RETURNED',
        };
        return mapping[status] || (status as Venda['status']);
    }

    async criar(venda: Venda): Promise<Venda> {
        try {
            const response = await api.post('/api/sales', venda);
            return response.data;
        } catch (err) {
            console.error('[vendas.service] erro ao criar venda:', err);
            throw err;
        }
    }

    async confirmar(id: number, location: string = 'default', username: string = 'system'): Promise<Venda> {
        try {
            const response = await api.post(`/api/sales/${id}/confirm`, null, {
                params: { location, username }
            });
            return response.data;
        } catch (err) {
            console.error('[vendas.service] erro ao confirmar venda:', err);
            throw err;
        }
    }

    async marcarEnviada(id: number, location: string = 'default', username: string = 'system'): Promise<Venda> {
        try {
            const response = await api.post(`/api/sales/${id}/ship`, null, {
                params: { location, username }
            });
            return response.data;
        } catch (err) {
            console.error('[vendas.service] erro ao marcar enviada:', err);
            throw err;
        }
    }
}

export default new VendasService();
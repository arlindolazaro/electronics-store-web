import api from './api';

export interface VendasPorPeriodoData {
    periodo: string;
    total: number;
    quantidade: number;
}

export interface StatusInventarioData {
    produtoId: number;
    produtoNome: string;
    quantidade: number;
    quantidadeMinima: number;
    status: string;
}

export interface MetricasAprovacaoData {
    totalAprovacoes: number;
    aprovadas: number;
    rejeitadas: number;
    pendentes: number;
}

export interface RelatorioInventario {
    totalQty: number;
    lowStockCount?: number;
}

class RelatoriosService {
    async getVendasPorPeriodo(): Promise<VendasPorPeriodoData[]> {
        // Chamada ao backend quando endpoint estiver pronto
        // const response = await api.get('/api/reports/vendas', { params: { periodo } });
        // return response.data;

        // Por enquanto retorna array vazio para não quebrar a UI
        return [];
    }

    async getStatusInventario(): Promise<StatusInventarioData[]> {
        // Endpoint: GET /api/reports/low-stock
        try {
            const response = await api.get('/api/reports/low-stock', { params: { threshold: 10 } });
            // Mapear de InventoryItem para StatusInventarioData
            return response.data.map((item: any) => ({
                produtoId: item.id,
                produtoNome: item.nomeProduto || `Produto ${item.id}`,
                quantidade: item.quantidade,
                quantidadeMinima: 10,
                status: item.quantidade < 10 ? 'Baixo' : 'Normal',
            }));
        } catch (error) {
            console.error('Erro ao carregar status inventário:', error);
            return [];
        }
    }

    async getMetricasAprovacoes(): Promise<MetricasAprovacaoData> {
        // Endpoint não existe ainda, retorna estrutura vazia
        // const response = await api.get('/api/reports/approval-metrics');
        // return response.data;

        return {
            totalAprovacoes: 0,
            aprovadas: 0,
            rejeitadas: 0,
            pendentes: 0,
        };
    }

    async getInventoryValue(): Promise<RelatorioInventario> {
        // Endpoint: GET /api/reports/inventory-value
        try {
            const response = await api.get('/api/reports/inventory-value');
            return response.data;
        } catch (error) {
            console.error('Erro ao carregar valor inventário:', error);
            return { totalQty: 0 };
        }
    }

    async getTurnoverRatio(variacaoId: number, days: number = 30): Promise<number> {
        // Endpoint: GET /api/reports/turnover/{variacaoId}
        try {
            const response = await api.get(`/api/reports/turnover/${variacaoId}`, { params: { days } });
            return response.data.turnoverRatio || 0;
        } catch (error) {
            console.error('Erro ao carregar taxa de rotatividade:', error);
            return 0;
        }
    }

    async getDaysOfStock(variacaoId: number, dailyConsumption: number = 1.0): Promise<number> {
        // Endpoint: GET /api/reports/dos/{variacaoId}
        try {
            const response = await api.get(`/api/reports/dos/${variacaoId}`, { params: { dailyConsumption } });
            return response.data.daysOfStock || 0;
        } catch (error) {
            console.error('Erro ao carregar dias de estoque:', error);
            return 0;
        }
    }
}

export default new RelatoriosService();

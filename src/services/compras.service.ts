import api from './api';

export interface PedidoCompra {
    id?: number;
    numeroCompra?: string;
    data: Date;
    fornecedorNome: string;
    fornecedorEmail?: string;
    status: 'DRAFT' | 'ENVIADO' | 'APROVADO' | 'REJEITADO' | 'RECEBIDO';
    total: number;
    justificativaRejeicao?: string;
    linhas: LinhaCompra[];
}

export interface LinhaCompra {
    id?: number;
    produtoId: number;
    variacaoId: number;
    quantidade: number;
    precoUnitario: number;
    total: number;
    quantidadeRecebida?: number;
    produtoNome?: string;
}

export interface ApprovalTask {
    id?: number;
    pedidoCompraId?: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    justificativaRejeicao?: string;
    criadoEm?: string | Date;
    atualizadoEm?: string | Date;
}

class ComprasService {
    async listar(): Promise<PedidoCompra[]> {
        const response = await api.get('/api/pos');
        return response.data;
    }

    async obter(id: number): Promise<PedidoCompra> {
        const response = await api.get(`/api/pos/${id}`);
        return response.data;
    }

    async criar(pedido: PedidoCompra): Promise<PedidoCompra> {
        const response = await api.post('/api/pos', pedido);
        return response.data;
    }

    async enviarParaAprovacao(id: number): Promise<PedidoCompra> {
        const response = await api.post(`/api/pos/${id}/send`);
        return response.data;
    }

    async receberMercadoria(poId: number, lineId: number, quantidadeRecebida: number): Promise<PedidoCompra> {
        const response = await api.post(`/api/pos/${poId}/lines/${lineId}/receive`, {
            quantidadeRecebida,
        });
        return response.data;
    }
}

class AprovacaoService {
    async listar(): Promise<ApprovalTask[]> {
        try {
            const response = await api.get('/api/approvals/pending');
            const data = response.data || [];
            // map backend ApprovalTask to frontend shape
            return data.map((t: any) => ({
                id: t.id,
                pedidoCompraId: t.targetId ? Number(t.targetId) : undefined,
                status: t.status,
                justificativaRejeicao: t.comment,
                criadoEm: t.requestedAt,
                atualizadoEm: t.decidedAt,
            }));
        } catch (error) {
            console.error('Erro ao listar tarefas de aprovação:', error);
            return [];
        }
    }

    async obter(id: number): Promise<ApprovalTask> {
        const response = await api.get(`/api/approvals/${id}`);
        const t = response.data;
        return {
            id: t.id,
            pedidoCompraId: t.targetId ? Number(t.targetId) : undefined,
            status: t.status,
            justificativaRejeicao: t.comment,
            criadoEm: t.requestedAt,
            atualizadoEm: t.decidedAt,
        };
    }

    async aprovar(id: number): Promise<ApprovalTask> {
        const approver = (() => {
            try {
                const u = localStorage.getItem('user');
                return u ? JSON.parse(u).username || JSON.parse(u).email || 'system' : 'system';
            } catch {
                return 'system';
            }
        })();

        const response = await api.post(`/api/approvals/${id}/approve`, { approver, comment: '' });
        const t = response.data;
        return {
            id: t.id,
            pedidoCompraId: t.targetId ? Number(t.targetId) : undefined,
            status: t.status,
            justificativaRejeicao: t.comment,
            criadoEm: t.requestedAt,
            atualizadoEm: t.decidedAt,
        };
    }

    async rejeitar(id: number, justificativa: string): Promise<ApprovalTask> {
        const approver = (() => {
            try {
                const u = localStorage.getItem('user');
                return u ? JSON.parse(u).username || JSON.parse(u).email || 'system' : 'system';
            } catch {
                return 'system';
            }
        })();

        const response = await api.post(`/api/approvals/${id}/reject`, { approver, comment: justificativa });
        const t = response.data;
        return {
            id: t.id,
            pedidoCompraId: t.targetId ? Number(t.targetId) : undefined,
            status: t.status,
            justificativaRejeicao: t.comment,
            criadoEm: t.requestedAt,
            atualizadoEm: t.decidedAt,
        };
    }
}

export default new ComprasService();
export const aprovacaoService = new AprovacaoService();

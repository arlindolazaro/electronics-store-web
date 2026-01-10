import api from './api';

export interface PedidoCompra {
    id?: number;
    numeroCompra?: string;
    data?: Date;
    supplier?: string;
    fornecedorNome?: string;
    fornecedorEmail?: string;
    status: 'DRAFT' | 'ENVIADO' | 'APROVADO' | 'REJEITADO' | 'RECEBIDO' | 'SENT' | 'ACCEPTED' | 'PARTIALLY_RECEIVED' | 'CLOSED' | 'CANCELLED';
    total?: number;
    justificativaRejeicao?: string;
    linhas?: LinhaCompra[];
    createdBy?: string;
    createdAt?: string | Date;
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
    private mapFromBackend(data: any): PedidoCompra {
        return {
            id: data.id,
            numeroCompra: data.numeroCompra || `#${data.id}`,
            data: data.createdAt,
            supplier: data.supplier,
            fornecedorNome: data.supplier || data.fornecedorNome,
            fornecedorEmail: data.fornecedorEmail,
            status: this.mapStatus(data.status),
            total: data.lines?.reduce((sum: number, line: any) => sum + (line.price * line.quantity), 0) || 0,
            justificativaRejeicao: data.comment,
            linhas: (data.lines || []).map((line: any) => ({
                id: line.id,
                produtoId: line.variacaoId,
                variacaoId: line.variacaoId,
                quantidade: line.quantity,
                precoUnitario: line.price || 0,
                total: line.price * line.quantity,
                quantidadeRecebida: line.quantidadeRecebida,
                produtoNome: line.productName,
            })),
            createdBy: data.createdBy,
            createdAt: data.createdAt,
        };
    }

    private mapStatus(status: string): PedidoCompra['status'] {
        const mapping: Record<string, PedidoCompra['status']> = {
            'DRAFT': 'DRAFT',
            'SENT': 'ENVIADO',
            'ACCEPTED': 'APROVADO',
            'PARTIALLY_RECEIVED': 'APROVADO',
            'CLOSED': 'RECEBIDO',
            'CANCELLED': 'REJEITADO',
        };
        return mapping[status] || (status as PedidoCompra['status']);
    }

    async listar(): Promise<PedidoCompra[]> {
        const response = await api.get('/api/pos');
        return response.data.map((item: any) => this.mapFromBackend(item));
    }

    async obter(id: number): Promise<PedidoCompra> {
        const response = await api.get(`/api/pos/${id}`);
        return this.mapFromBackend(response.data);
    }

    async criar(pedido: PedidoCompra): Promise<PedidoCompra> {
        const payload = {
            supplier: pedido.fornecedorNome || pedido.supplier,
            fornecedorEmail: pedido.fornecedorEmail,
            poLines: (pedido.linhas || []).map(linha => ({
                variacaoId: linha.variacaoId,
                qty: linha.quantidade,
                unitPrice: linha.precoUnitario,
            })),
        };
        const response = await api.post('/api/pos', payload);
        return this.mapFromBackend(response.data);
    }

    async enviarParaAprovacao(id: number): Promise<PedidoCompra> {
        try {
            const user = localStorage.getItem('user');
            const username = user ? JSON.parse(user).email || JSON.parse(user).username || 'system' : 'system';
            const response = await api.post(`/api/pos/${id}/send?username=${encodeURIComponent(username)}`);
            return this.mapFromBackend(response.data);
        } catch (error) {
            console.error('Erro ao enviar para aprovação:', error);
            throw error;
        }
    }

    async receberMercadoria(poId: number, lineId: number, quantidadeRecebida: number): Promise<PedidoCompra> {
        try {
            const user = localStorage.getItem('user');
            const username = user ? JSON.parse(user).email || JSON.parse(user).username || 'system' : 'system';
            const response = await api.post(
                `/api/pos/${poId}/lines/${lineId}/receive?qty=${quantidadeRecebida}&username=${encodeURIComponent(username)}`
            );
            return this.mapFromBackend(response.data);
        } catch (error) {
            console.error('Erro ao receber mercadoria:', error);
            throw error;
        }
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

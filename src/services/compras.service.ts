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
    async listar(): Promise<PedidoCompra[]> {
        try {
            const response = await api.get('/api/pos');
            return (response.data || []).map((item: any) => this.normalizeCompra(item));
        } catch (err) {
            console.error('[compras.service] erro ao listar compras:', err);
            throw err;
        }
    }

    async obter(id: number): Promise<PedidoCompra> {
        try {
            const response = await api.get(`/api/pos/${id}`);
            return this.normalizeCompra(response.data);
        } catch (err) {
            console.error('[compras.service] erro ao obter compra:', err);
            throw err;
        }
    }

    private normalizeCompra(data: any): PedidoCompra {
        const linhasData = data.linhas || data.lines || [];

        return {
            id: data.id,
            numeroCompra: data.numeroCompra || `#${data.id}`,
            data: data.createdAt || data.data,
            supplier: data.supplier || data.fornecedorNome,
            fornecedorNome: data.fornecedorNome || data.supplier,
            fornecedorEmail: data.fornecedorEmail,
            status: this.normalizeStatus(data.status),
            total: Number(data.total) || (linhasData?.reduce((sum: number, line: any) => sum + ((line.precoUnitario || line.price || 0) * (line.quantidade || line.quantity)), 0) || 0),
            justificativaRejeicao: data.comment || data.justificativaRejeicao,
            linhas: linhasData.map((line: any) => ({
                id: line.id,
                produtoId: line.produtoId,
                variacaoId: line.variacaoId,
                quantidade: Number(line.quantidade || line.quantity),
                precoUnitario: Number(line.precoUnitario || line.price || 0),
                total: Number(line.total || ((line.precoUnitario || line.price || 0) * (line.quantidade || line.quantity))),
                quantidadeRecebida: line.quantidadeRecebida ? Number(line.quantidadeRecebida) : 0,
                produtoNome: line.produtoNome || line.productName,
            })),
            createdBy: data.createdBy,
            createdAt: data.createdAt,
        };
    }

    private normalizeStatus(status: string): PedidoCompra['status'] {
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
        return this.normalizeCompra(response.data);
    }

    async enviarParaAprovacao(id: number): Promise<PedidoCompra> {
        try {
            const user = localStorage.getItem('user');
            const username = user ? JSON.parse(user).email || JSON.parse(user).username || 'system' : 'system';
            const response = await api.post(`/api/pos/${id}/send?username=${encodeURIComponent(username)}`);
            return this.normalizeCompra(response.data);
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
            return this.normalizeCompra(response.data);
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

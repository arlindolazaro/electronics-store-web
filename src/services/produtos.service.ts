import api from './api';

export interface Produto {
    id?: number;
    nome: string;
    descricao?: string;
    categoria?: string;
    status?: string; // ex: 'ACTIVO' | 'INATIVO'
    precoPadrao?: number | string;
    fotoBase64?: string;
    variacoes?: ProdutoVariacao[];
}

export interface ProdutoVariacao {
    id?: number;
    produtoId: number;
    nome: string;
    sku: string;
    preco: number;
    quantidade: number;
    quantidadeReservada: number;
}

class ProdutosService {
    async listar(): Promise<Produto[]> {
        const response = await api.get('/api/produtos');
        return response.data;
    }

    async obter(id: number): Promise<Produto> {
        const response = await api.get(`/api/produtos/${id}`);
        return response.data;
    }

    async criar(produto: Produto): Promise<Produto> {
        const response = await api.post('/api/produtos', produto);
        return response.data;
    }

    async atualizar(id: number, produto: Partial<Produto>): Promise<Produto> {
        const response = await api.put(`/api/produtos/${id}`, produto);
        return response.data;
    }

    async deletar(id: number): Promise<void> {
        await api.delete(`/api/produtos/${id}`);
    }
}

export default new ProdutosService();
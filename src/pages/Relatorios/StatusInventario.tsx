import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertTriangle, Package, Loader2 } from 'lucide-react';
import relatoriosService, { type StatusInventarioData } from '../../services/relatorios.service';
import { toast } from 'sonner';

const StatusInventario: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<StatusInventarioData[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await relatoriosService.getStatusInventario();
      setItems(data);
    } catch (error) {
      toast.error('Erro ao carregar status do inventário');
    } finally {
      setIsLoading(false);
    }
  };

  const lowStockCount = items.filter(i => i.status === 'Baixo').length;
  const normalStockCount = items.length - lowStockCount;
  
  const chartData = [
    { name: 'Normal', value: normalStockCount },
    { name: 'Baixo', value: lowStockCount }
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Status do Inventário</h1>
        <p className="text-gray-600 text-sm mt-2">Monitore produtos com estoque baixo e visualize status geral do inventário</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-semibold">Total de Produtos</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{items.length}</p>
            </div>
            <Package size={40} className="text-blue-400 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-semibold">Estoque Baixo</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{lowStockCount}</p>
            </div>
            <AlertTriangle size={40} className="text-red-400 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-semibold">Estoque Normal</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{normalStockCount}</p>
            </div>
            <Package size={40} className="text-green-400 opacity-80" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 flex justify-center items-center min-h-96">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : items && items.length > 0 ? (
        <>
          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfico de Pizza */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Estoque</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico de Barras */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quantidade por Status</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabela de Produtos */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Detalhes por Produto</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Produto</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Quantidade</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Mínimo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.produtoId} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-900 font-medium">{item.produtoNome}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{item.quantidade}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{item.quantidadeMinima}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white ${
                        item.status === 'Baixo' 
                          ? 'bg-red-600'
                          : 'bg-green-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhum dado disponível</h3>
          <p className="text-sm text-gray-600 mt-1">Adicione produtos com variações para ver o status do inventário</p>
        </div>
      )}
    </div>
  );
};

export default StatusInventario;

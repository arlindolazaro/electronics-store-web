import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, Loader2 } from 'lucide-react';
import relatoriosService from '../../services/relatorios.service';
import { toast } from 'sonner';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface VendaData {
  periodo: string;
  quantidade: number;
  total: number;
}

const VendasPorPeriodo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<VendaData[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const vendas = await relatoriosService.getVendasPorPeriodo();
      setData(vendas || []);
    } catch (error) {
      toast.error('Erro ao carregar relatório de vendas');
    } finally {
      setIsLoading(false);
    }
  };

  const totalQuantidade = data.reduce((sum: number, item) => sum + (item.quantidade || 0), 0);
  const totalValor = data.reduce((sum: number, item) => sum + (item.total || 0), 0);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vendas por Período</h1>
        <p className="text-gray-600 text-sm mt-2">Visualize as vendas agrupadas por período (dia/semana/mês)</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-semibold">Total de Períodos</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{data.length}</p>
            </div>
            <BarChart3 size={40} className="text-blue-400 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-semibold">Quantidade Vendida</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{formatNumber(totalQuantidade)}</p>
            </div>
            <TrendingUp size={40} className="text-green-400 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-semibold">Valor Total</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {formatCurrency(totalValor)}
              </p>
            </div>
            <BarChart3 size={40} className="text-purple-400 opacity-80" />
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Gráfico de Vendas</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-4 py-2 rounded-lg transition ${
                    chartType === 'bar' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Barras
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-4 py-2 rounded-lg transition ${
                    chartType === 'line' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Linha
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              {chartType === 'bar' ? (
                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="periodo" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => formatNumber(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="quantidade" fill="#3b82f6" name="Quantidade" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="total" fill="#10b981" name="Valor (MZN)" radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="periodo"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => formatNumber(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="quantidade" stroke="#3b82f6" name="Quantidade" strokeWidth={2} />
                  <Line type="monotone" dataKey="total" stroke="#10b981" name="Valor (MZN)" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum dado disponível</h3>
            <p className="text-sm text-gray-600 mt-1">Os dados de vendas aparecerão aqui quando houver registros no sistema</p>
          </div>
        )}
      </div>

      {/* Tabela de Dados */}
      {data && data.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Detalhes por Período</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Período</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Quantidade</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Valor Total (MZN)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-900 font-medium">{item.periodo}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{formatNumber(item.quantidade)}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VendasPorPeriodo;

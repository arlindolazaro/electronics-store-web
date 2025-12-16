import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CheckCircle, XCircle, Clock, BarChart3, Loader2 } from 'lucide-react';
import relatoriosService, { type MetricasAprovacaoData } from '../../services/relatorios.service';
import { toast } from 'sonner';

const MetricasAprovacoes: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricasAprovacaoData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await relatoriosService.getMetricasAprovacoes();
      setMetrics(data);
    } catch (error) {
      toast.error('Erro ao carregar métricas de aprovações');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!metrics || metrics.totalAprovacoes === 0) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Métricas de Aprovações</h1>
          <p className="text-gray-600 text-sm mt-2">Estatísticas de pedidos de compra em aprovação</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhuma aprovação registrada</h3>
          <p className="text-sm text-gray-600 mt-1">As métricas aparecerão aqui quando houver pedidos de compra em aprovação</p>
        </div>
      </div>
    );
  }

  const taxaAprovacao = metrics.totalAprovacoes > 0 
    ? ((metrics.aprovadas / metrics.totalAprovacoes) * 100).toFixed(1)
    : 0;

  const chartData = [
    { name: 'Aprovadas', value: metrics.aprovadas },
    { name: 'Rejeitadas', value: metrics.rejeitadas },
    { name: 'Pendentes', value: metrics.pendentes }
  ];

  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Métricas de Aprovações</h1>
        <p className="text-gray-600 text-sm mt-2">Estatísticas de pedidos de compra em aprovação</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-semibold">Total</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{metrics.totalAprovacoes}</p>
            </div>
            <BarChart3 size={40} className="text-blue-400 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-semibold">Aprovadas</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{metrics.aprovadas}</p>
            </div>
            <CheckCircle size={40} className="text-green-400 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-semibold">Rejeitadas</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{metrics.rejeitadas}</p>
            </div>
            <XCircle size={40} className="text-red-400 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-700 font-semibold">Pendentes</p>
              <p className="text-3xl font-bold text-amber-900 mt-2">{metrics.pendentes}</p>
            </div>
            <Clock size={40} className="text-amber-400 opacity-80" />
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pizza */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição de Aprovações</h2>
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

        {/* Barras */}
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

      {/* Taxa de Aprovação */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Taxa de Aprovação</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 font-medium">Taxa geral</p>
            <p className="text-2xl font-bold text-green-600">{taxaAprovacao}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${taxaAprovacao}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {metrics.aprovadas} de {metrics.totalAprovacoes} pedidos aprovados
          </p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700 font-semibold mb-1">Aprovação</p>
          <p className="text-2xl font-bold text-green-900">
            {((metrics.aprovadas / metrics.totalAprovacoes) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-semibold mb-1">Rejeição</p>
          <p className="text-2xl font-bold text-red-900">
            {((metrics.rejeitadas / metrics.totalAprovacoes) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700 font-semibold mb-1">Pendentes</p>
          <p className="text-2xl font-bold text-amber-900">
            {((metrics.pendentes / metrics.totalAprovacoes) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetricasAprovacoes;

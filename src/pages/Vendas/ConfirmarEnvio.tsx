import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const ConfirmarEnvio: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/vendas')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
      >
        <ArrowLeft size={20} /> Voltar
      </button>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-start gap-4">
        <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
        <div>
          <h2 className="text-lg font-semibold text-blue-900 mb-2">Acção deslocada</h2>
          <p className="text-blue-800">
            A acção de confirmar envio foi integrada ao detalhe da venda (DetalheVenda.tsx). 
            <br />
            Acesse <strong>Vendas → Venda #{id} → Marcar como Enviada</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarEnvio;

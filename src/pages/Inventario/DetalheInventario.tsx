import React from 'react';
import { useParams } from 'react-router-dom';

const DetalheInventario: React.FC = () => {
  const { id } = useParams();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Detalhe do Inventário #{id}</h1>
      <p>Movimentações e histórico de estoque (placeholder).</p>
    </div>
  );
};

export default DetalheInventario;

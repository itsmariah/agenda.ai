import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { PageHeader } from '../../components/ui';

interface Establishment {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
}

export default function ClientHome() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);

  useEffect(() => {
    api.get('/establishments').then(({ data }) => setEstablishments(data));
  }, []);

  return (
    <div>
      <PageHeader
        align="start"
        title="Agendar horário"
        subtitle="Escolha o estabelecimento para iniciar o agendamento."
        className="mb-8"
      />

      {establishments.length === 0 ? (
        <div className="text-center mt-16 text-gray-400">
          <p className="text-4xl mb-3">🏪</p>
          <p>Nenhum estabelecimento disponível.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {establishments.map((est) => (
            <Link
              key={est.id}
              to={`/client/book/${est.id}`}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-xl font-bold group-hover:bg-blue-200 transition-colors">
                  {est.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{est.name}</h2>
                  {est.description && <p className="text-sm text-gray-500 mt-0.5">{est.description}</p>}
                  {est.address && <p className="text-xs text-gray-400 mt-1">📍 {est.address}</p>}
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                Agendar via IA →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

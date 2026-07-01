import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Button, PageHeader } from '../../components/ui';

interface InsightCard {
  type: 'success' | 'warning' | 'info' | 'opportunity';
  title: string;
  description: string;
  metric: string;
}

const typeStyles: Record<InsightCard['type'], { bg: string; border: string; badge: string; icon: string }> = {
  success: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', icon: '✅' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', icon: '⚠️' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: 'ℹ️' },
  opportunity: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: '🚀' },
};

export default function Insights() {
  const [estId, setEstId] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    api.get('/establishments/my').then(({ data }) => setEstId(data.id));
  }, []);

  async function generate() {
    if (!estId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/ai/insights/${estId}`);
      setInsights(data.insights);
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <PageHeader
        align="start"
        title="💡 Insights IA"
        subtitle="Análise inteligente dos dados do seu estabelecimento."
        action={
          <Button
            onClick={generate}
            loading={loading}
            className="flex items-center gap-2"
            loadingText={
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analisando...
              </>
            }
          >
            ✨ Gerar Insights
          </Button>
        }
      />

      {!generated && !loading && (
        <div className="mt-16 text-center">
          <p className="text-5xl mb-4">💡</p>
          <p className="text-gray-500">
            Clique em "Gerar Insights" para que a IA analise os dados do seu negócio e forneça
            recomendações acionáveis.
          </p>
        </div>
      )}

      {loading && (
        <div className="mt-16 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 text-sm">
            A IA está analisando seus dados... isso pode levar alguns segundos.
          </p>
        </div>
      )}

      {insights.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {insights.map((insight, i) => {
            const s = typeStyles[insight.type];
            return (
              <div key={i} className={`${s.bg} ${s.border} border rounded-xl p-6`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.badge}`}>
                        {insight.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                    <p className="text-xl font-bold text-gray-900">{insight.metric}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

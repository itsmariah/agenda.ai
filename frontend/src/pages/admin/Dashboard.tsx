import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/api';
import { Button, Card, ConfirmDialog, PageHeader } from '../../components/ui';

interface Stats {
  total: number;
  thisMonth: number;
  lastMonth: number;
  cancelledThisMonth: number;
  byService: { serviceName?: string; serviceId: string; count: number }[];
  byEmployee: { employeeName?: string; employeeId: string; count: number }[];
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [estId, setEstId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get('/establishments/my').then(({ data }) => {
      setEstId(data.id);
      return api.get(`/appointments/establishment/${data.id}/stats`);
    }).then(({ data }) => setStats(data));
  }, []);

  const growthPct = stats && stats.lastMonth > 0
    ? (((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100).toFixed(0)
    : null;

  async function handleDelete() {
    if (!estId) return;
    setDeleting(true);
    try {
      await api.delete(`/establishments/${estId}`);
      navigate('/admin/onboarding', { replace: true });
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  }

  return (
    <div className="p-8">
      <PageHeader
        align="start"
        title={`Bom dia, ${user?.name?.split(' ')[0]} 👋`}
        subtitle="Aqui está um resumo do seu estabelecimento."
        className="mb-0"
      />

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-4 mt-8 lg:grid-cols-4">
            <StatCard label="Total de agendamentos" value={stats.total} />
            <StatCard
              label="Este mês"
              value={stats.thisMonth}
              sub={growthPct ? `${growthPct}% vs. mês passado` : undefined}
            />
            <StatCard label="Mês passado" value={stats.lastMonth} />
            <StatCard label="Cancelamentos (mês)" value={stats.cancelledThisMonth} />
          </div>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <Card>
              <h2 className="font-semibold text-gray-900 mb-4">Serviços mais realizados</h2>
              <ul className="space-y-3">
                {stats.byService.slice(0, 5).map((s, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{s.serviceName ?? s.serviceId}</span>
                    <span className="font-medium text-blue-600">{s.count}x</span>
                  </li>
                ))}
                {stats.byService.length === 0 && (
                  <p className="text-sm text-gray-400">Sem dados ainda.</p>
                )}
              </ul>
            </Card>

            <Card>
              <h2 className="font-semibold text-gray-900 mb-4">Funcionários mais ativos</h2>
              <ul className="space-y-3">
                {stats.byEmployee.slice(0, 5).map((e, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{e.employeeName ?? e.employeeId}</span>
                    <span className="font-medium text-blue-600">{e.count}x</span>
                  </li>
                ))}
                {stats.byEmployee.length === 0 && (
                  <p className="text-sm text-gray-400">Sem dados ainda.</p>
                )}
              </ul>
            </Card>
          </div>
        </>
      )}

      <Card className="mt-8">
        <h2 className="font-semibold text-gray-900">Zona de risco</h2>
        <p className="text-sm text-gray-500 mt-1">
          Excluir o estabelecimento apaga permanentemente serviços, funcionários, agendamentos e
          conversas relacionados. Essa ação não pode ser desfeita.
        </p>
        <Button variant="danger" size="sm" className="mt-4" onClick={() => setShowConfirm(true)}>
          Excluir estabelecimento
        </Button>
      </Card>

      <ConfirmDialog
        open={showConfirm}
        title="Excluir estabelecimento"
        message="Tem certeza que deseja excluir esse negócio? Essa ação é permanente e vai apagar todos os serviços, funcionários, agendamentos e conversas relacionados."
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        loading={deleting}
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Badge, Card, PageHeader, STATUS_LABELS, STATUS_TONES } from '../../components/ui';

interface Appointment {
  id: string;
  startTime: string;
  status: string;
  service: { name: string; durationMinutes: number; price: number };
  employee: { name: string };
  establishment: { name: string; address?: string };
  notes?: string;
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    api.get('/appointments/my').then(({ data }) => setAppointments(data));
  }, []);

  const upcoming = appointments.filter(
    (a) => new Date(a.startTime) >= new Date() && a.status !== 'CANCELLED',
  );
  const past = appointments.filter(
    (a) => new Date(a.startTime) < new Date() || a.status === 'CANCELLED',
  );

  function AppCard({ a }: { a: Appointment }) {
    return (
      <Card padding="sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-medium text-gray-900">{a.service.name}</p>
            <p className="text-sm text-gray-500">
              {a.establishment.name} · {a.employee.name}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              {new Date(a.startTime).toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
              })}{' '}
              às{' '}
              {new Date(a.startTime).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {a.notes && <p className="text-xs text-gray-400 italic mt-1">"{a.notes}"</p>}
          </div>
          <div className="text-right shrink-0">
            <Badge tone={STATUS_TONES[a.status] ?? 'gray'}>{STATUS_LABELS[a.status]}</Badge>
            <p className="text-sm font-semibold text-gray-700 mt-2">
              R$ {Number(a.service.price).toFixed(2)}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader align="start" title="Meus agendamentos" className="mb-8" />

      {appointments.length === 0 ? (
        <div className="text-center mt-16 text-gray-400">
          <p className="text-4xl mb-3">📅</p>
          <p>Você ainda não tem agendamentos.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Próximos
              </h2>
              <div className="space-y-3">
                {upcoming.map((a) => <AppCard key={a.id} a={a} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Histórico
              </h2>
              <div className="space-y-3 opacity-70">
                {past.map((a) => <AppCard key={a.id} a={a} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

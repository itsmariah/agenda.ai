import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Card, Input, PageHeader, STATUS_LABELS, statusClasses } from '../../components/ui';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  client: { name: string; phone?: string };
  employee: { name: string };
  service: { name: string; price: number };
  notes?: string;
}

export default function Appointments() {
  const [estId, setEstId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    api.get('/establishments/my').then(({ data }) => setEstId(data.id));
  }, []);

  useEffect(() => {
    if (!estId) return;
    api
      .get(`/appointments/establishment/${estId}`, { params: { date } })
      .then(({ data }) => setAppointments(data));
  }, [estId, date]);

  async function updateStatus(id: string, status: string) {
    await api.patch(`/appointments/${id}/status`, { status });
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
  }

  return (
    <div className="p-8">
      <PageHeader
        title="📅 Agendamentos"
        action={<Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-auto" />}
      />

      {appointments.length === 0 ? (
        <div className="text-center mt-16 text-gray-400">
          <p className="text-4xl mb-3">📅</p>
          <p>Nenhum agendamento neste dia.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <Card key={a.id} padding="sm" className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-500 w-20 shrink-0 text-center">
                <p>{new Date(a.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-xs">{new Date(a.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{a.client.name}</p>
                <p className="text-sm text-gray-500">
                  {a.service.name} · {a.employee.name}
                </p>
                {a.notes && <p className="text-xs text-gray-400 mt-1 italic">"{a.notes}"</p>}
              </div>
              <p className="text-sm font-semibold text-gray-700 shrink-0">
                R$ {Number(a.service.price).toFixed(2)}
              </p>
              <select
                value={a.status}
                onChange={(e) => updateStatus(a.id, e.target.value)}
                className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${statusClasses(a.status)}`}
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

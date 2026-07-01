import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Button, Card, Field, Input, PageHeader } from '../../components/ui';

interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  active: boolean;
  schedules: { dayOfWeek: string; startTime: string; endTime: string }[];
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const DAY_PT: Record<string, string> = {
  MONDAY: 'Seg', TUESDAY: 'Ter', WEDNESDAY: 'Qua',
  THURSDAY: 'Qui', FRIDAY: 'Sex', SATURDAY: 'Sáb', SUNDAY: 'Dom',
};

export default function Employees() {
  const [estId, setEstId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    schedules: DAYS.slice(0, 5).map((d) => ({ dayOfWeek: d, startTime: '08:00', endTime: '18:00' })),
  });

  useEffect(() => {
    api.get('/establishments/my').then(({ data }) => {
      setEstId(data.id);
      return api.get(`/establishments/${data.id}/employees`);
    }).then(({ data }) => setEmployees(data));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!estId) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/establishments/${estId}/employees`, form);
      setEmployees((prev) => [...prev, data]);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-8">
      <PageHeader
        title="👥 Funcionários"
        action={<Button onClick={() => setShowForm((v) => !v)}>+ Novo funcionário</Button>}
      />

      {showForm && (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Novo funcionário</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Nome', field: 'name', required: true },
              { label: 'E-mail', field: 'email', required: false },
              { label: 'Telefone', field: 'phone', required: false },
            ].map(({ label, field, required }) => (
              <Field key={field} label={label}>
                <Input
                  value={form[field as 'name' | 'email' | 'phone']}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  required={required}
                />
              </Field>
            ))}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Horário de trabalho</p>
            <div className="space-y-2">
              {form.schedules.map((s, i) => (
                <div key={s.dayOfWeek} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">{DAY_PT[s.dayOfWeek]}</span>
                  <input
                    type="time"
                    value={s.startTime}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        schedules: f.schedules.map((x, j) =>
                          i === j ? { ...x, startTime: e.target.value } : x,
                        ),
                      }))
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-gray-400 text-sm">às</span>
                  <input
                    type="time"
                    value={s.endTime}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        schedules: f.schedules.map((x, j) =>
                          i === j ? { ...x, endTime: e.target.value } : x,
                        ),
                      }))
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" loading={saving} loadingText="Salvando...">
              Salvar
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {employees.map((emp) => (
          <Card key={emp.id} padding="sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                {emp.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{emp.name}</p>
                <p className="text-sm text-gray-500">{emp.email ?? emp.phone ?? '—'}</p>
              </div>
              <div className="flex gap-1">
                {emp.schedules.map((s) => (
                  <span key={s.dayOfWeek} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {DAY_PT[s.dayOfWeek]}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
        {employees.length === 0 && (
          <p className="text-center text-gray-400 mt-12">Nenhum funcionário cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}

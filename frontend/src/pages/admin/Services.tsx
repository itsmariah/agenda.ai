import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Badge, Button, Card, Field, Input, PageHeader } from '../../components/ui';

interface Service {
  id: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  active: boolean;
}

const empty = { name: '', description: '', durationMinutes: 30, price: 0 };

export default function Services() {
  const [estId, setEstId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/establishments/my').then(({ data }) => {
      setEstId(data.id);
      return api.get(`/establishments/${data.id}/services`);
    }).then(({ data }) => setServices(data));
  }, []);

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!estId) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/establishments/${estId}/services`, form);
      setServices((s) => [...s, data]);
      setForm(empty);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(svc: Service) {
    const { data } = await api.patch(`/establishments/${estId}/services/${svc.id}`, {
      active: !svc.active,
    });
    setServices((s) => s.map((x) => (x.id === svc.id ? data : x)));
  }

  return (
    <div className="p-8">
      <PageHeader
        title="✂️ Serviços"
        action={<Button onClick={() => setShowForm((v) => !v)}>+ Novo serviço</Button>}
      />

      {showForm && (
        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Novo serviço</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome">
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </Field>
            <Field label="Duração (minutos)">
              <Input
                type="number"
                min={5}
                value={form.durationMinutes}
                onChange={(e) => set('durationMinutes', Number(e.target.value))}
                required
              />
            </Field>
            <Field label="Preço (R$)">
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => set('price', Number(e.target.value))}
                required
              />
            </Field>
            <Field label="Descrição (opcional)">
              <Input value={form.description} onChange={(e) => set('description', e.target.value)} />
            </Field>
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
        {services.map((s) => (
          <Card key={s.id} padding="sm" active={s.active} className="flex items-center gap-4">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{s.name}</p>
              {s.description && <p className="text-sm text-gray-500">{s.description}</p>}
              <p className="text-xs text-gray-400 mt-1">
                {s.durationMinutes} min · R$ {Number(s.price).toFixed(2)}
              </p>
            </div>
            <Badge tone={s.active ? 'green' : 'gray'} onClick={() => toggleActive(s)}>
              {s.active ? 'Ativo' : 'Inativo'}
            </Badge>
          </Card>
        ))}
        {services.length === 0 && (
          <p className="text-center text-gray-400 mt-12">Nenhum serviço cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}

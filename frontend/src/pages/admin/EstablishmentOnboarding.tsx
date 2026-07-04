import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import { Button, Field, Input } from '../../components/ui';

const empty = { name: '', phone: '', address: '', description: '' };

export default function EstablishmentOnboarding() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/establishments', form);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erro ao criar estabelecimento.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-blue-600">agenda.ai</h1>
          <p className="text-gray-500 text-sm mt-1">Vamos configurar seu negócio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nome do estabelecimento">
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
              placeholder="Barbearia do João"
            />
          </Field>
          <Field label="Telefone (opcional)">
            <Input
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </Field>
          <Field label="Endereço (opcional)">
            <Input
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Rua das Flores, 123"
            />
          </Field>
          <Field label="Descrição (opcional)">
            <Input
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Conte um pouco sobre o seu negócio"
            />
          </Field>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" loading={loading} loadingText="Salvando..." className="w-full">
            Continuar
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 hover:underline">
            Sair
          </button>
        </p>
      </div>
    </div>
  );
}

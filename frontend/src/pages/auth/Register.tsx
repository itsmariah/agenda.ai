import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import { Button, Field, Input } from '../../components/ui';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { ...form, role: 'CLIENT' });
      login(data.token, data.user);
      navigate('/client');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-blue-600">agenda.ai</h1>
          <p className="text-gray-500 text-sm mt-1">Crie sua conta de cliente</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Nome completo', field: 'name', type: 'text', placeholder: 'Seu nome' },
            { label: 'E-mail', field: 'email', type: 'email', placeholder: 'seu@email.com' },
            { label: 'Telefone', field: 'phone', type: 'tel', placeholder: '(11) 99999-9999' },
            { label: 'Senha', field: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, field, type, placeholder }) => (
            <Field key={field} label={label}>
              <Input
                type={type}
                value={form[field as keyof typeof form]}
                onChange={(e) => set(field, e.target.value)}
                required={field !== 'phone'}
                placeholder={placeholder}
              />
            </Field>
          ))}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" loading={loading} loadingText="Criando conta..." className="w-full">
            Criar conta
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import { Button, Field, Input } from '../../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      navigate(data.user.role === 'CLIENT' ? '/client' : '/admin');
    } catch {
      setError('E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-blue-600">agenda.ai</h1>
          <p className="text-gray-500 text-sm mt-1">Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="E-mail">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </Field>
          <Field label="Senha">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </Field>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" loading={loading} loadingText="Entrando..." className="w-full">
            Entrar
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Não tem conta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}

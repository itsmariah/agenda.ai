import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Button, Field, Input } from '../../components/ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-blue-600">agenda.ai</h1>
          <p className="text-gray-500 text-sm mt-1">Recuperar senha</p>
        </div>

        {sent ? (
          <p className="text-sm text-gray-600 text-center">
            Se este e-mail estiver cadastrado, enviamos um link para redefinir sua senha. Confira sua caixa de
            entrada.
          </p>
        ) : (
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

            <Button type="submit" loading={loading} loadingText="Enviando..." className="w-full">
              Enviar link de redefinição
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}

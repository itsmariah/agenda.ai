import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Badge, Button } from '../components/ui';

const PLATFORMS = [
  {
    icon: '🌐',
    title: 'Aplicação web',
    description: 'Acesse direto do navegador, em qualquer computador, sem instalar nada.',
    available: true,
  },
  {
    icon: '🖥️',
    title: 'Desktop (Windows, macOS, Linux)',
    description: 'Um aplicativo instalável para usar o agenda.ai fora do navegador.',
    available: false,
  },
  {
    icon: '📱',
    title: 'Mobile (iOS e Android)',
    description: 'Gerencie seu negócio direto do celular, onde estiver.',
    available: false,
  },
];

const FEATURES = [
  {
    icon: '🤖',
    title: 'Agendamento por IA',
    description: 'Seus clientes marcam horário conversando naturalmente com um assistente — sem precisar de app ou formulário.',
  },
  {
    icon: '📅',
    title: 'Gestão de agendamentos',
    description: 'Veja tudo em um só lugar: horários do dia, status de cada cliente, confirmações e cancelamentos.',
  },
  {
    icon: '💡',
    title: 'Insights automáticos',
    description: 'A IA analisa seus dados e sugere oportunidades, alertas e melhorias para o seu negócio.',
  },
  {
    icon: '👥',
    title: 'Equipe organizada',
    description: 'Cadastre profissionais, horários de trabalho e serviços — a disponibilidade é calculada automaticamente.',
  },
];

const STEPS = [
  { title: 'Escolhe o serviço', description: 'O cliente conta o que precisa, direto no chat.' },
  { title: 'Conversa com a IA', description: 'Ela mostra profissionais e horários disponíveis na hora.' },
  { title: 'Confirma o horário', description: 'Agendamento feito — sem ligação, sem ida e volta.' },
];

export default function LandingPage() {
  const { user } = useAuthStore();

  if (user) {
    return <Navigate to={user.role === 'CLIENT' ? '/client' : '/admin'} replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-xl font-bold text-blue-600">agenda.ai</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Entrar
          </Link>
          <Link to="/register?as=admin">
            <Button size="sm">Cadastre seu negócio</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-6xl mx-auto px-6 py-20 grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Agendamentos no piloto automático, com IA cuidando do seu cliente
            </h1>
            <p className="text-blue-100 text-lg mt-6">
              O agenda.ai deixa seus clientes marcarem horário sozinhos, conversando com um
              assistente inteligente — enquanto você foca no seu negócio e recebe insights
              automáticos sobre o que está funcionando.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <Link to="/register?as=admin">
                <Button size="md" variant="inverse">
                  Começar grátis
                </Button>
              </Link>
              <Link to="/login" className="text-white font-medium hover:underline">
                Já tenho conta →
              </Link>
            </div>
          </div>

          {/* Chat mock */}
          <div className="bg-white rounded-2xl shadow-xl p-4 max-w-sm mx-auto w-full">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-3">
              <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs shrink-0">
                AI
              </span>
              <p className="text-sm font-medium text-gray-700">Assistente de agendamento</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white text-sm px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
                  Quero cortar o cabelo amanhã à tarde
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 text-sm px-4 py-2 rounded-2xl rounded-bl-sm max-w-[80%]">
                  Tenho às 14h30 com a Ana ou 16h com o Carlos. Qual prefere?
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white text-sm px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
                  16h com o Carlos, por favor
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 text-sm px-4 py-2 rounded-2xl rounded-bl-sm max-w-[80%]">
                  Prontinho! Agendado para amanhã às 16h ✅
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center">
          Tudo que o seu negócio precisa, em um só lugar
        </h2>
        <div className="grid gap-6 mt-12 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-semibold text-gray-900 mt-4">{f.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Client experience */}
      <section className="bg-blue-50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center">
            Seus clientes agendam sozinhos, sem esforço
          </h2>
          <div className="grid gap-8 mt-12 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center mx-auto">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-gray-900 mt-4">{s.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Escolha a plataforma */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center">
          Use do jeito que preferir
        </h2>
        <p className="text-gray-500 text-center mt-2">Web hoje, desktop e mobile em breve.</p>
        <div className="grid gap-6 mt-12 sm:grid-cols-3">
          {PLATFORMS.map((p) => (
            <div
              key={p.title}
              className={`bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center ${
                p.available ? '' : 'opacity-60'
              }`}
            >
              <span className="text-3xl">{p.icon}</span>
              <h3 className="font-semibold text-gray-900 mt-4">{p.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{p.description}</p>
              <div className="mt-4">
                {p.available ? (
                  <Link to="/login">
                    <Button size="sm">Usar agora</Button>
                  </Link>
                ) : (
                  <Badge tone="gray">Em breve</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">
            Pronto para modernizar sua agenda?
          </h2>
          <p className="text-blue-100 mt-3">Crie sua conta grátis e configure seu negócio em minutos.</p>
          <Link to="/register?as=admin">
            <Button size="md" variant="inverse" className="mt-6">
              Cadastre seu negócio
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-8 text-center text-sm text-gray-500">
        agenda.ai © {new Date().getFullYear()} —{' '}
        <Link to="/login" className="hover:text-blue-600 hover:underline">
          Entrar
        </Link>
      </footer>
    </div>
  );
}

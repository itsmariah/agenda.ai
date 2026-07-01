import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Button } from './ui';

const links = [
  { to: '/admin', label: '📊 Dashboard', end: true },
  { to: '/admin/assistant', label: '🤖 Assistente IA' },
  { to: '/admin/insights', label: '💡 Insights' },
  { to: '/admin/appointments', label: '📅 Agendamentos' },
  { to: '/admin/services', label: '✂️ Serviços' },
  { to: '/admin/employees', label: '👥 Funcionários' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link to="/admin" className="text-xl font-bold text-blue-600">
            agenda.ai
          </Link>
          <p className="text-xs text-gray-500 mt-1">{user?.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="none"
            onClick={handleLogout}
            className="w-full text-left py-2 hover:text-red-600"
          >
            Sair
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

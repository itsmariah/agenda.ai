import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import api from '../lib/api';
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
  const [checking, setChecking] = useState(user?.role === 'ADMIN');

  function handleLogout() {
    logout();
    navigate('/login');
  }

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    api.get('/establishments/my').then(({ data }) => {
      if (!data) {
        navigate('/admin/onboarding', { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [user?.role, navigate]);

  if (checking) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <Link to="/admin" className="text-xl font-bold text-blue-600">
            agenda.ai
          </Link>
          <Link
            to="/admin/profile"
            className="flex items-center gap-2 mt-3 pl-1.5 pr-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="w-6 h-6 shrink-0 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
            {user?.name}
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-2 pl-3 pr-3 py-2 border-l-[3px] rounded-r-lg text-sm transition-colors ${
                  isActive
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
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

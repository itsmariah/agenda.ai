import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { Button } from './ui';

export default function ClientLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-blue-600">agenda.ai</span>
        <nav className="flex items-center gap-6">
          <NavLink
            to="/client"
            end
            className={({ isActive }) =>
              `text-sm font-medium pb-1 border-b-2 transition-colors ${
                isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Agendar
          </NavLink>
          <NavLink
            to="/client/appointments"
            className={({ isActive }) =>
              `text-sm font-medium pb-1 border-b-2 transition-colors ${
                isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`
            }
          >
            Meus agendamentos
          </NavLink>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            to="/client/profile"
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
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
          <Button variant="ghost" size="none" onClick={handleLogout} className="hover:text-red-600">
            Sair
          </Button>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

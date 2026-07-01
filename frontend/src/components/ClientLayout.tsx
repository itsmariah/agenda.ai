import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-blue-600">agenda.ai</span>
        <nav className="flex items-center gap-6">
          <NavLink
            to="/client"
            end
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`
            }
          >
            Agendar
          </NavLink>
          <NavLink
            to="/client/appointments"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`
            }
          >
            Meus agendamentos
          </NavLink>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.name}</span>
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

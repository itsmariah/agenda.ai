import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import AdminLayout from './components/AdminLayout';
import ClientLayout from './components/ClientLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/admin/Dashboard';
import Assistant from './pages/admin/Assistant';
import Insights from './pages/admin/Insights';
import Appointments from './pages/admin/Appointments';
import Services from './pages/admin/Services';
import Employees from './pages/admin/Employees';
import ClientHome from './pages/client/ClientHome';
import BookingChat from './pages/client/BookingChat';
import MyAppointments from './pages/client/MyAppointments';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route element={<PrivateRoute allowedRoles={['ADMIN', 'EMPLOYEE']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/assistant" element={<Assistant />} />
            <Route path="/admin/insights" element={<Insights />} />
            <Route path="/admin/appointments" element={<Appointments />} />
            <Route path="/admin/services" element={<Services />} />
            <Route path="/admin/employees" element={<Employees />} />
          </Route>
        </Route>

        {/* Client */}
        <Route element={<PrivateRoute allowedRoles={['CLIENT']} />}>
          <Route element={<ClientLayout />}>
            <Route path="/client" element={<ClientHome />} />
            <Route path="/client/book/:estId" element={<BookingChat />} />
            <Route path="/client/appointments" element={<MyAppointments />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

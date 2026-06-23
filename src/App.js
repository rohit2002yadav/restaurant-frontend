import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from './components/ui/Toast';

import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import VerifyOTP      from './pages/auth/VerifyOTP';
import CustomerHome   from './pages/customer/CustomerHome';
import JoinQueue      from './pages/customer/JoinQueue';
import QueueStatus    from './pages/customer/QueueStatus';
import AdminDashboard from './pages/admin/AdminDashboard';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function DefaultRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/customer/home'} replace />;
}

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public */}
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        {/* Customer */}
        <Route path="/customer/home"   element={<ProtectedRoute role="customer"><CustomerHome /></ProtectedRoute>} />
        <Route path="/customer/join"   element={<ProtectedRoute role="customer"><JoinQueue /></ProtectedRoute>} />
        <Route path="/customer/status" element={<ProtectedRoute role="customer"><QueueStatus /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

        {/* Default */}
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from './components/ui/Toast';
import ThemeToggle from './components/ui/ThemeToggle';

import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import VerifyOTP      from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword  from './pages/auth/ResetPassword';
import Landing        from './pages/Landing';
import CustomerHome   from './pages/customer/CustomerHome';
import JoinQueue      from './pages/customer/JoinQueue';
import QueueStatus    from './pages/customer/QueueStatus';
import CustomerFeedback from './pages/customer/CustomerFeedback';
import AdminDashboard  from './pages/admin/AdminDashboard';
import RestaurantSetup from './pages/admin/RestaurantSetup';
import TableManagement from './pages/admin/TableManagement';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function DefaultRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/customer/home'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
        {/* Public */}
        <Route path="/"           element={<Landing />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/verify-otp"       element={<VerifyOTP />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/reset-password"   element={<ResetPassword />} />

        {/* Customer */}
        <Route path="/customer/home"   element={<ProtectedRoute role="customer"><CustomerHome /></ProtectedRoute>} />
        <Route path="/customer/join"   element={<ProtectedRoute role="customer"><JoinQueue /></ProtectedRoute>} />
        <Route path="/customer/status"   element={<ProtectedRoute role="customer"><QueueStatus /></ProtectedRoute>} />
        <Route path="/customer/feedback" element={<ProtectedRoute role="customer"><CustomerFeedback /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard"    element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/setup"        element={<ProtectedRoute role="admin"><RestaurantSetup /></ProtectedRoute>} />
        <Route path="/admin/tables"       element={<ProtectedRoute role="admin"><TableManagement /></ProtectedRoute>} />

        {/* Default */}
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastContainer />
          <ThemeToggle style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }} />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

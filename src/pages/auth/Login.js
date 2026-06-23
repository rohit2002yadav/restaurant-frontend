import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../components/ui/Toast';
import { authAPI } from '../../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res  = await authAPI.login({ email: form.email, password: form.password });
      const data = res.data;
      login(data.user, data.tokens);
      toast('Welcome back!', 'success');
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/customer/home');
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.needs_verification) {
        localStorage.setItem('pendingEmail', errData.email);
        toast('Please verify your email first', 'info');
        navigate('/verify-otp?purpose=registration');
        return;
      }
      toast(errData?.error ?? 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '48px 16px' }}>
        <div className="anim-scale-in" style={{ width: '100%', maxWidth: 420 }}>

          {/* Logo */}
          <div className="text-center mb-6">
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 60, height: 60, borderRadius: 18,
              background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
              boxShadow: '0 8px 24px rgba(249,115,22,0.3)',
              fontSize: 26, marginBottom: 16
            }}>🍽️</div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 6 }}>
              Welcome back
            </h1>
            <p className="text-muted text-sm">Sign in to your account</p>
          </div>

          {/* Form card */}
          <div className="card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                icon={HiMail}
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                error={errors.email}
              />

              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                icon={HiLockClosed}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                error={errors.password}
                rightElement={
                  <button type="button" className="input-right-btn" onClick={() => setShowPass(p => !p)}>
                    {showPass ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                  </button>
                }
              />

              <Button type="submit" loading={loading} style={{ marginTop: 8 }}>
                Sign In
              </Button>
            </form>
          </div>

          <p className="text-center text-muted text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}

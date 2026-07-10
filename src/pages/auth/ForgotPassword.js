import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiMail } from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { authAPI } from '../../api/axios';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    setError('');
    setLoading(true);
    try {
      await authAPI.requestPasswordReset({ email });
      localStorage.setItem('pendingEmail', email);
      toast('OTP sent! Check your email (or Django terminal in dev)', 'success');
      navigate('/reset-password');
    } catch {
      toast('Something went wrong. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '48px 16px' }}>
        <div className="anim-scale-in" style={{ width: '100%', maxWidth: 420 }}>

          <div className="text-center mb-6">
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 60, height: 60, borderRadius: 18,
              background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
              boxShadow: '0 8px 24px rgba(249,115,22,0.3)',
              fontSize: 26, marginBottom: 16
            }}>🔑</div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 6 }}>
              Forgot password?
            </h1>
            <p className="text-muted text-sm">Enter your email and we'll send you a reset OTP</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                icon={HiMail}
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={error}
              />
              <Button type="submit" loading={loading} style={{ marginTop: 8 }}>
                Send Reset OTP
              </Button>
            </form>
          </div>

          <p className="text-center text-muted text-sm mt-6">
            Remember your password?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}

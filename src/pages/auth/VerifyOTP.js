import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { authAPI } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function VerifyOTP() {
  const navigate  = useNavigate();
  const [params]  = useSearchParams();
  const { login } = useAuth();
  const purpose   = params.get('purpose') ?? 'registration';
  const email     = localStorage.getItem('pendingEmail') ?? '';

  const [otp, setOtp]             = useState(['', '', '', '', '', '']);
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => { if (!email) navigate('/register'); }, [email, navigate]);
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { toast('Enter all 6 digits', 'error'); return; }
    setLoading(true);
    try {
      const res  = await authAPI.verifyOTP({ email, otp: code, purpose });
      const data = res.data;
      if (purpose === 'registration') {
        localStorage.removeItem('pendingEmail');
        localStorage.removeItem('pendingRole');
        toast('Email verified! Please log in.', 'success');
        navigate('/login');
      } else {
        login(data.user, data.tokens);
        localStorage.removeItem('pendingEmail');
        toast('Login successful!', 'success');
        navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/customer/home');
      }
    } catch (err) {
      toast(err.response?.data?.error ?? 'Invalid OTP', 'error');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await authAPI.resendOTP({ email, purpose });
      toast(res.data.message ?? 'OTP resent!', 'success');
      setCountdown(60); setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch { toast('Failed to resend OTP', 'error'); }
    finally { setResending(false); }
  };

  return (
    <PageWrapper>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '48px 16px' }}>
        <div className="anim-scale-in" style={{ width: '100%', maxWidth: 400 }}>

          <div className="text-center mb-6">
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 60, height: 60, borderRadius: 18,
              background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
              boxShadow: '0 8px 24px rgba(249,115,22,0.3)',
              fontSize: 26, marginBottom: 16
            }}>📧</div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: 8 }}>Verify your email</h1>
            <p className="text-muted text-sm">
              We sent a 6-digit OTP to<br />
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{email}</span>
            </p>
          </div>

          <div className="card">
            {/* OTP boxes */}
            <div onPaste={handlePaste} style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  style={{
                    width: 48, height: 56,
                    textAlign: 'center',
                    fontSize: '1.375rem', fontWeight: 700,
                    fontFamily: 'var(--font-sans)',
                    background: 'var(--color-bg-input)',
                    border: `2px solid ${digit ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text)',
                    outline: 'none',
                    transition: 'var(--transition)',
                    boxShadow: digit ? '0 0 0 3px var(--color-primary-muted)' : 'none',
                  }}
                />
              ))}
            </div>

            <Button onClick={handleVerify} loading={loading}>Verify OTP</Button>

            <div className="text-center mt-4">
              {canResend ? (
                <button onClick={handleResend} disabled={resending}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                  {resending ? 'Sending...' : 'Resend OTP'}
                </button>
              ) : (
                <p className="text-muted text-sm">
                  Resend in <span style={{ color: 'var(--color-text)' }}>{countdown}s</span>
                </p>
              )}
            </div>
          </div>

          <p className="text-center text-subtle text-xs mt-6">
            Wrong email?{' '}
            <button onClick={() => navigate('/register')}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem' }}>
              Go back
            </button>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}

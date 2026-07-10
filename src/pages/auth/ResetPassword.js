import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { authAPI } from '../../api/axios';

export default function ResetPassword() {
  const navigate  = useNavigate();
  const email     = localStorage.getItem('pendingEmail') ?? '';

  const [otp, setOtp]               = useState(['', '', '', '', '', '']);
  const [newPass, setNewPass]       = useState('');
  const [confirmPass, setConfirm]   = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [resending, setResending]   = useState(false);
  const [countdown, setCountdown]   = useState(60);
  const [canResend, setCanResend]   = useState(false);
  const [errors, setErrors]         = useState({});
  const inputRefs = useRef([]);

  useEffect(() => { if (!email) navigate('/forgot-password'); }, [email, navigate]);
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleOtpChange = (i, val) => {
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

  const validate = () => {
    const e = {};
    if (otp.join('').length < 6) e.otp = 'Enter all 6 digits';
    if (!newPass)                 e.newPass = 'New password is required';
    if (newPass.length < 6)      e.newPass = 'Minimum 6 characters';
    if (newPass !== confirmPass)  e.confirmPass = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.resetPassword({
        email,
        otp: otp.join(''),
        new_password: newPass,
        confirm_password: confirmPass,
      });
      localStorage.removeItem('pendingEmail');
      toast('Password reset! Please log in.', 'success');
      navigate('/login');
    } catch (err) {
      const errData = err.response?.data;
      toast(errData?.error ?? errData?.confirm_password ?? 'Reset failed', 'error');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.requestPasswordReset({ email });
      toast('OTP resent!', 'success');
      setCountdown(60); setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch { toast('Failed to resend OTP', 'error'); }
    finally { setResending(false); }
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
            }}>🔒</div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 6 }}>
              Reset password
            </h1>
            <p className="text-muted text-sm">
              OTP sent to <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{email}</span>
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* OTP boxes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 8 }}>
                  Enter OTP
                </label>
                <div onPaste={handlePaste} style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
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
                {errors.otp && <p style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: 6 }}>{errors.otp}</p>}
              </div>

              <Input
                label="New password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                icon={HiLockClosed}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                error={errors.newPass}
                rightElement={
                  <button type="button" className="input-right-btn" onClick={() => setShowPass(p => !p)}>
                    {showPass ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                  </button>
                }
              />

              <Input
                label="Confirm new password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                icon={HiLockClosed}
                value={confirmPass}
                onChange={e => setConfirm(e.target.value)}
                error={errors.confirmPass}
              />

              <Button type="submit" loading={loading} style={{ marginTop: 4 }}>
                Reset Password
              </Button>
            </form>

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
        </div>
      </div>
    </PageWrapper>
  );
}

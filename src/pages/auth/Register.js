import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiMail, HiLockClosed, HiUser, HiPhone, HiOfficeBuilding, HiLocationMarker, HiEye, HiEyeOff } from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { authAPI } from '../../api/axios';

const EMPTY = { name: '', email: '', phone: '', password: '', confirm: '', restaurant_name: '', restaurant_address: '' };

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole]         = useState('customer');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [form, setForm]         = useState(EMPTY);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name)    e.name    = 'Full name is required';
    if (!form.email)   e.email   = 'Email is required';
    if (!form.phone || !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter valid 10-digit Indian mobile number';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (role === 'admin') {
      if (!form.restaurant_name)    e.restaurant_name    = 'Restaurant name is required';
      if (!form.restaurant_address) e.restaurant_address = 'Restaurant address is required';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = role === 'admin'
        ? { name: form.name, email: form.email, phone: form.phone, password: form.password, confirm_password: form.confirm, restaurant_name: form.restaurant_name, restaurant_address: form.restaurant_address }
        : { name: form.name, email: form.email, phone: form.phone, password: form.password, confirm_password: form.confirm };

      const res = await (role === 'admin' ? authAPI.adminRegister : authAPI.customerRegister)(payload);
      localStorage.setItem('pendingEmail', form.email);
      localStorage.setItem('pendingRole', role);
      toast(res.data.message ?? 'OTP sent!', 'success');
      navigate('/verify-otp?purpose=registration');
    } catch (err) {
      const errData = err.response?.data;
      if (errData && typeof errData === 'object' && !errData.error) {
        const fieldErrors = {};
        Object.entries(errData).forEach(([k, v]) => { fieldErrors[k] = Array.isArray(v) ? v[0] : String(v); });
        setErrors(fieldErrors);
        toast(Object.values(fieldErrors)[0] ?? 'Fix errors below', 'error');
      } else {
        toast(errData?.error ?? 'Registration failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '48px 16px' }}>
        <div className="anim-scale-in" style={{ width: '100%', maxWidth: 440 }}>

          {/* Logo */}
          <div className="text-center mb-6">
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg, #f97316, #ea6c0a)', boxShadow: '0 8px 24px rgba(249,115,22,0.3)', fontSize: 26, marginBottom: 16 }}>🍽️</div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: 6 }}>Create account</h1>
            <p className="text-muted text-sm">Join the queue system</p>
          </div>

          {/* Role toggle */}
          <div className="role-toggle mb-6">
            {['customer', 'admin'].map(r => (
              <button key={r} type="button" className={`role-toggle-btn${role === r ? ' active' : ''}`} onClick={() => { setRole(r); setErrors({}); }}>
                {r === 'admin' ? '👨‍💼 Staff / Admin' : '🧑 Customer'}
              </button>
            ))}
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Personal info — same for both roles */}
              <Input label="Full Name"  type="text"  placeholder="Rohit Yadav"      icon={HiUser}       value={form.name}  onChange={set('name')}  error={errors.name} />
              <Input label="Email"      type="email" placeholder="you@example.com"  icon={HiMail}       value={form.email} onChange={set('email')} error={errors.email} />
              <Input label="Phone"      type="tel"   placeholder="9876543210"        icon={HiPhone}      value={form.phone} onChange={set('phone')} error={errors.phone} />
              <Input
                label="Password" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters"
                icon={HiLockClosed} value={form.password} onChange={set('password')} error={errors.password}
                rightElement={
                  <button type="button" className="input-right-btn" onClick={() => setShowPass(p => !p)}>
                    {showPass ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                  </button>
                }
              />
              <Input label="Confirm Password" type="password" placeholder="Repeat password" icon={HiLockClosed} value={form.confirm} onChange={set('confirm')} error={errors.confirm} />

              {/* Restaurant info — admin only */}
              {role === 'admin' && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />
                  <Input label="Restaurant Name"    type="text" placeholder="Spice Garden"               icon={HiOfficeBuilding} value={form.restaurant_name}    onChange={set('restaurant_name')}    error={errors.restaurant_name} />
                  <Input label="Restaurant Address" type="text" placeholder="123 MG Road, Mumbai 400001" icon={HiLocationMarker} value={form.restaurant_address} onChange={set('restaurant_address')} error={errors.restaurant_address} />
                </>
              )}

              <Button type="submit" loading={loading} style={{ marginTop: 8 }}>Create Account</Button>
            </form>
          </div>

          <p className="text-center text-muted text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </PageWrapper>
  );
}

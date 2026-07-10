import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiTable, HiArrowRight, HiCheck } from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { restaurantAPI } from '../../api/axios';
import { toast } from '../../components/ui/Toast';

export default function RestaurantSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Guard: redirect to dashboard if tables already exist
  useEffect(() => {
    if (!user?.restaurant_id) return;
    restaurantAPI.getTables(user.restaurant_id)
      .then(res => {
        if (res.data.length > 0) navigate('/admin/dashboard', { replace: true });
      })
      .catch(() => {});
  }, [user, navigate]);

  const [step, setStep]       = useState(1);
  const [count, setCount]     = useState('');
  const [countErr, setCountErr] = useState('');
  const [tables, setTables]   = useState([]);
  const [saving, setSaving]   = useState(false);

  /* ── Step 1: validate count and generate table rows ── */
  const handleCountNext = () => {
    const n = parseInt(count, 10);
    if (!count || isNaN(n) || n < 1 || n > 100) {
      setCountErr('Enter a number between 1 and 100');
      return;
    }
    setCountErr('');
    setTables(Array.from({ length: n }, (_, i) => ({ table_number: `T${i + 1}`, capacity: 4 })));
    setStep(2);
  };

  /* ── Step 2: edit capacity for a row ── */
  const setCapacity = (i, val) => {
    const n = parseInt(val, 10);
    setTables(prev => prev.map((t, idx) => idx === i ? { ...t, capacity: isNaN(n) ? '' : n } : t));
  };

  /* ── Step 2: save all tables ── */
  const handleSave = async () => {
    const invalid = tables.find(t => !t.capacity || t.capacity < 1 || t.capacity > 20);
    if (invalid) {
      toast(`Capacity for ${invalid.table_number} must be 1–20`, 'error');
      return;
    }
    setSaving(true);
    try {
      await restaurantAPI.bulkCreate(user.restaurant_id, tables);
      toast('Tables saved! Welcome to your dashboard.', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      toast(err.response?.data?.error ?? 'Failed to save tables', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '48px 16px' }}>
        <div className="anim-scale-in" style={{ width: '100%', maxWidth: 520 }}>

          {/* Header */}
          <div className="text-center mb-6">
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg,#f97316,#ea6c0a)', boxShadow: '0 8px 24px rgba(249,115,22,0.3)', fontSize: 26, marginBottom: 16 }}>🍽️</div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: 6 }}>Restaurant Setup</h1>
            <p className="text-muted text-sm">Let's set up your tables before you start.</p>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.875rem',
                  background: step >= s ? 'var(--color-primary)' : 'var(--color-bg-input)',
                  color: step >= s ? '#fff' : 'var(--color-text-muted)',
                  border: `2px solid ${step >= s ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  transition: 'var(--transition)',
                }}>
                  {step > s ? <HiCheck size={14} /> : s}
                </div>
                <span style={{ fontSize: '0.8125rem', color: step >= s ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: step === s ? 600 : 400 }}>
                  {s === 1 ? 'Number of Tables' : 'Set Capacities'}
                </span>
                {s < 2 && <div style={{ width: 32, height: 2, background: step > s ? 'var(--color-primary)' : 'var(--color-border)', borderRadius: 2 }} />}
              </div>
            ))}
          </div>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="card anim-fade-up">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <HiTable size={20} style={{ color: 'var(--color-primary)' }} />
                <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>How many tables does your restaurant have?</h2>
              </div>
              <input
                type="number" min={1} max={100}
                placeholder="e.g. 10"
                value={count}
                onChange={e => { setCount(e.target.value); setCountErr(''); }}
                onKeyDown={e => e.key === 'Enter' && handleCountNext()}
                style={{
                  width: '100%', padding: '14px 16px',
                  background: 'var(--color-bg-input)',
                  border: `1px solid ${countErr ? 'var(--color-error)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text)', fontSize: '1.125rem', fontWeight: 600,
                  fontFamily: 'var(--font-sans)', outline: 'none',
                  marginBottom: countErr ? 8 : 20,
                }}
              />
              {countErr && <p style={{ color: 'var(--color-error)', fontSize: '0.8125rem', marginBottom: 16 }}>{countErr}</p>}
              <Button onClick={handleCountNext}>
                Next <HiArrowRight size={16} />
              </Button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="card anim-fade-up">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Set capacity for each table</h2>
                <span className="text-muted text-sm">{tables.length} tables</span>
              </div>

              {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8, padding: '0 4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Table</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Capacity (seats)</span>
              </div>

              {/* Table rows — scrollable if many */}
              <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, paddingRight: 4 }}>
                {tables.map((t, i) => (
                  <div key={t.table_number} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'center' }}>
                    <div style={{
                      padding: '10px 14px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-primary-muted)',
                      color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.9375rem',
                    }}>
                      {t.table_number}
                    </div>
                    <input
                      type="number" min={1} max={20}
                      value={t.capacity}
                      onChange={e => setCapacity(i, e.target.value)}
                      style={{
                        padding: '10px 14px',
                        background: 'var(--color-bg-input)',
                        border: `1px solid ${(!t.capacity || t.capacity < 1 || t.capacity > 20) ? 'var(--color-error)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-text)', fontWeight: 600, fontSize: '0.9375rem',
                        fontFamily: 'var(--font-sans)', outline: 'none', width: '100%',
                      }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setStep(1)}
                  style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '0.9375rem' }}
                >
                  Back
                </button>
                <div style={{ flex: 2 }}>
                  <Button onClick={handleSave} loading={saving}>
                    <HiCheck size={16} /> Save Tables
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageWrapper>
  );
}

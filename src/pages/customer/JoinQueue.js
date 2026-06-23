import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiUserGroup } from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { queueAPI } from '../../api/axios';
import { toast } from '../../components/ui/Toast';
import { RESTAURANT_ID } from '../../utils/constants';

const PARTY_OPTIONS = [
  { size: 1, label: '1',  desc: 'Solo',   emoji: '🧑' },
  { size: 2, label: '2',  desc: 'Couple', emoji: '👫' },
  { size: 3, label: '3',  desc: 'Small',  emoji: '👨‍👩‍👦' },
  { size: 4, label: '4',  desc: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { size: 5, label: '5',  desc: 'Group',  emoji: '🎉' },
  { size: 6, label: '6+', desc: 'Large',  emoji: '🎊' },
];

export default function JoinQueue() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const [partySize, setPartySize] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(null);

  const handleJoin = async () => {
    if (!partySize) return;
    setLoading(true);
    try {
      const res  = await queueAPI.joinQueue({
        name:          user.name,
        phone:         user.phone,
        party_size:    partySize,
        restaurant_id: RESTAURANT_ID,
      });
      const data = res.data;
      localStorage.setItem('queueToken', data.token);
      setSuccess(data);
      setTimeout(() => navigate('/customer/status'), 2500);
    } catch (err) {
      toast(err.response?.data?.error ?? 'Failed to join queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PageWrapper>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '32px 16px', textAlign: 'center' }}>
          <div className="anim-scale-in" style={{ fontSize: 72, marginBottom: 24 }}>🎫</div>
          <h2 className="anim-fade-up" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>
            {success.status === 'seated' ? 'Table Ready!' : "You're in the queue!"}
          </h2>
          <div className="card anim-fade-up" style={{ width: '100%', maxWidth: 360, marginTop: 16 }}>
            <p className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 4 }}>{success.token}</p>
            <p className="text-muted text-sm">Your token number</p>
            {success.wait_time > 0 && (
              <p style={{ color: 'var(--color-primary)', fontWeight: 600, marginTop: 12 }}>~{success.wait_time} min wait</p>
            )}
            {success.status === 'seated' && (
              <p style={{ color: 'var(--color-success)', fontWeight: 600, marginTop: 12 }}>🪑 Table {success.table} assigned!</p>
            )}
          </div>
          <p className="text-subtle text-sm" style={{ marginTop: 24 }}>Redirecting to status page...</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="anim-fade-up" style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px', minHeight: '100vh' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/customer/home')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', marginBottom: 32, padding: 0, fontSize: '0.9375rem', fontFamily: 'var(--font-sans)' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--color-text)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
        >
          <HiArrowLeft size={16} /> Back
        </button>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>Join the Queue</h1>
          <p className="text-muted text-sm">Select your party size to get a token</p>
        </div>

        {/* Party size grid */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <HiUserGroup size={20} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 600 }}>Party Size</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {PARTY_OPTIONS.map(opt => {
              const selected = partySize === opt.size;
              return (
                <button
                  key={opt.size}
                  onClick={() => setPartySize(opt.size)}
                  style={{
                    padding: '16px 8px',
                    borderRadius: 'var(--radius-lg)',
                    border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: selected ? 'var(--color-primary-muted)' : 'var(--color-bg-input)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'var(--transition)',
                    boxShadow: selected ? 'var(--shadow-primary)' : 'none',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{opt.emoji}</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: selected ? 'var(--color-primary)' : 'var(--color-text)' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <Button onClick={handleJoin} loading={loading} disabled={!partySize}>
          {partySize ? `Join Queue — Party of ${partySize}` : 'Select party size'}
        </Button>

      </div>
    </PageWrapper>
  );
}

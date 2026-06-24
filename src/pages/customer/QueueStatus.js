import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiRefresh, HiLogout, HiClock, HiUsers } from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { queueAPI } from '../../api/axios';
import { toast } from '../../components/ui/Toast';
import { STATUS_LABELS, RESTAURANT_ID } from '../../utils/constants';

const STATUS_BADGE = {
  waiting:   'badge-waiting',
  called:    'badge-called',
  seated:    'badge-seated',
  completed: 'badge-completed',
  no_show:   'badge-no_show',
  left:      'badge-left',
};

export default function QueueStatus() {
  const navigate  = useNavigate();
  const token     = localStorage.getItem('queueToken');
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [showLeave, setShowLeave]     = useState(false);
  const [leaving, setLeaving]         = useState(false);
  const [countdown, setCountdown]     = useState(30);

  const fetchStatus = useCallback(async (silent = false) => {
    if (!token) { navigate('/customer/home'); return; }
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const res = await queueAPI.getStatus(token);
      setData(res.data);
      setCountdown(30);
    } catch (err) {
      if (err.response?.status === 404) {
        // Token no longer exists in DB (stale localStorage) — clear and redirect
        localStorage.removeItem('queueToken');
        navigate('/customer/home');
        return;
      }
      toast('Could not fetch status', 'error');
    } finally { setLoading(false); setRefreshing(false); }
  }, [token, navigate]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);
  useEffect(() => {
    const i = setInterval(() => fetchStatus(true), 30000);
    return () => clearInterval(i);
  }, [fetchStatus]);
  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 30), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await queueAPI.leaveQueue({ token, restaurant_id: RESTAURANT_ID });
      localStorage.removeItem('queueToken');
      toast('You have left the queue', 'info');
      navigate('/customer/home');
    } catch { toast('Failed to leave queue', 'error'); }
    finally { setLeaving(false); }
  };

  if (loading) return (
    <PageWrapper>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p className="text-muted">Fetching your status...</p>
      </div>
    </PageWrapper>
  );

  if (!data) return null;

  const { queue_entry: entry, position, people_ahead } = data;
  const isActive = ['waiting', 'called'].includes(entry?.status);
  const progress = position > 0 ? Math.max(5, 100 - (people_ahead / (people_ahead + 1)) * 100) : 100;

  return (
    <PageWrapper>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Queue Status</h1>
          <button onClick={() => fetchStatus(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 8, borderRadius: 8, animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }}>
            <HiRefresh size={20} />
          </button>
        </div>

        {/* Token Card */}
        <div className="card text-center anim-scale-in" style={{ marginBottom: 16 }}>
          <p className="text-muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Your Token</p>
          <p className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, marginBottom: 12 }}>{entry?.token_number}</p>
          <span className={`badge ${STATUS_BADGE[entry?.status] ?? 'badge-waiting'}`}>
            {STATUS_LABELS[entry?.status] ?? entry?.status}
          </span>
        </div>

        {/* Waiting state */}
        {entry?.status === 'waiting' && (
          <div className="anim-fade-up" style={{ marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="stat-card">
                <HiUsers size={20} style={{ color: 'var(--color-primary)' }} />
                <span className="stat-value" style={{ color: 'var(--color-primary)' }}>{people_ahead}</span>
                <span className="stat-label">Ahead of you</span>
              </div>
              <div className="stat-card">
                <HiClock size={20} style={{ color: '#60a5fa' }} />
                <span className="stat-value" style={{ color: '#60a5fa' }}>{entry?.estimated_wait_mins ?? 0}m</span>
                <span className="stat-label">Est. wait</span>
              </div>
            </div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                <span>Position #{position}</span>
                <span>Party of {entry?.party_size}</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Called state */}
        {entry?.status === 'called' && (
          <div className="card text-center anim-scale-in" style={{ marginBottom: 24, borderColor: 'rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.08)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 8 }}>Your table is ready!</h3>
            <p className="text-muted text-sm">Please come to the restaurant within 10 minutes.</p>
          </div>
        )}

        {/* Seated state */}
        {entry?.status === 'seated' && (
          <div className="card text-center anim-scale-in" style={{ marginBottom: 24, borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🪑</div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 8 }}>Enjoy your meal!</h3>
            <p className="text-muted text-sm">You are seated. Bon appétit!</p>
          </div>
        )}

        {/* Done states */}
        {['completed', 'no_show', 'left'].includes(entry?.status) && (
          <div className="card text-center anim-scale-in" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {entry?.status === 'completed' ? '✅' : entry?.status === 'no_show' ? '⏰' : '👋'}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 16 }}>
              {entry?.status === 'completed' ? 'Visit complete!' : entry?.status === 'no_show' ? 'Marked as no-show' : 'Left queue'}
            </h3>
            <Button onClick={() => { localStorage.removeItem('queueToken'); navigate('/customer/home'); }}>
              Back to Home
            </Button>
          </div>
        )}

        {isActive && <p className="text-center text-subtle text-xs" style={{ marginBottom: 16 }}>Auto-refreshing in {countdown}s</p>}

        {isActive && entry?.status === 'waiting' && (
          <Button variant="ghost" onClick={() => setShowLeave(true)}>
            <HiLogout size={16} /> Leave Queue
          </Button>
        )}

        {/* Leave modal */}
        {showLeave && (
          <div className="modal-overlay" onClick={() => setShowLeave(false)}>
            <div className="modal-sheet anim-slide-up" onClick={e => e.stopPropagation()}>
              <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 8 }}>Leave queue?</h3>
                <p className="text-muted text-sm" style={{ marginBottom: 24 }}>You'll lose your position and token. This cannot be undone.</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button variant="ghost" onClick={() => setShowLeave(false)}>Cancel</Button>
                  <Button variant="danger" onClick={handleLeave} loading={leaving}>Leave</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

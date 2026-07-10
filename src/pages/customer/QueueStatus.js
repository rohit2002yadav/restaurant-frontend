import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiRefresh, HiLogout, HiClock, HiUsers,
  HiChat, HiCheckCircle, HiOfficeBuilding, HiPhone, HiLocationMarker,
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { queueAPI } from '../../api/axios';
import { toast } from '../../components/ui/Toast';
import { STATUS_LABELS } from '../../utils/constants';

// ── helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE = {
  waiting:   'badge-waiting',
  called:    'badge-called',
  seated:    'badge-seated',
  completed: 'badge-completed',
  no_show:   'badge-no_show',
  left:      'badge-left',
};

const PLACEHOLDER_PATTERNS = [
  /please update/i,
  /not available/i,
  /your address/i,
  /dashboard/i,
  /n\/a/i,
];

function isPlaceholder(str) {
  if (!str || !str.trim()) return true;
  return PLACEHOLDER_PATTERNS.some(p => p.test(str));
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function calcWait(start, end) {
  const mins = Math.round((new Date(end) - new Date(start)) / 60000);
  if (mins < 1) return '< 1 min';
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ── sub-components ────────────────────────────────────────────────────────────

function DetailCell({ label, value, accent }) {
  return (
    <div style={{ background: 'var(--color-bg-input)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
      <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</p>
      <p style={{ fontWeight: accent ? 800 : 600, fontSize: accent ? '1.0625rem' : '0.9375rem', color: accent ? 'var(--color-primary)' : 'var(--color-text)' }}>
        {value ?? '—'}
      </p>
    </div>
  );
}

// Steps: index maps to status progression
const STEPS = [
  { key: 'joined',  label: 'Joined'  },
  { key: 'waiting', label: 'Waiting' },
  { key: 'called',  label: 'Called'  },
  { key: 'seated',  label: 'Seated'  },
];

// activeIdx: which step is currently active (0-based)
// doneUpTo: how many steps before activeIdx are actually completed
// called_at being null means the Called step was skipped (immediate seating)
function resolveStepState(status, calledAt) {
  switch (status) {
    case 'waiting':   return { activeIdx: 1, calledDone: false };
    case 'called':    return { activeIdx: 2, calledDone: false };
    case 'seated':    return { activeIdx: 3, calledDone: !!calledAt };
    case 'completed': return { activeIdx: 3, calledDone: !!calledAt };
    case 'no_show':   return { activeIdx: 3, calledDone: !!calledAt };
    case 'left':      return { activeIdx: 1, calledDone: false };
    default:          return { activeIdx: 0, calledDone: false };
  }
}

function ProgressStepper({ status, calledAt }) {
  const { activeIdx, calledDone } = resolveStepState(status, calledAt);
  return (
    <div className="stepper" style={{ marginBottom: 24 }}>
      {STEPS.map((step, i) => {
        // Step i is "done" if it is strictly before the active step,
        // EXCEPT step 2 (Called) which is only done if calledAt is set.
        const isDone = i < activeIdx && (i !== 2 || calledDone);
        const active = i === activeIdx;
        return (
          <div key={step.key} className={`stepper-step${isDone ? ' done' : active ? ' active' : ''}`}>
            <div className="stepper-dot">{isDone ? '✓' : i + 1}</div>
            <span className="stepper-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function QueueStatus() {
  const navigate     = useNavigate();
  const { logout }   = useAuth();
  const token        = localStorage.getItem('queueToken');
  const restaurantId = localStorage.getItem('queueRestaurantId');

  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLeave, setShowLeave]   = useState(false);
  const [leaving, setLeaving]       = useState(false);
  const [countdown, setCountdown]   = useState(30);

  const fetchStatus = useCallback(async (silent = false) => {
    if (!token) { navigate('/customer/home'); return; }
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const res = await queueAPI.getStatus(token);
      setData(res.data);
      setCountdown(30);
    } catch (err) {
      if (err.response?.status === 404) {
        localStorage.removeItem('queueToken');
        localStorage.removeItem('queueRestaurantId');
        navigate('/customer/home');
        return;
      }
      toast('Could not fetch status', 'error');
    } finally { setLoading(false); setRefreshing(false); }
  }, [token, navigate]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Auto-refresh only while waiting or called
  useEffect(() => {
    const i = setInterval(() => {
      if (['waiting', 'called'].includes(data?.status)) fetchStatus(true);
    }, 30000);
    return () => clearInterval(i);
  }, [fetchStatus, data?.status]);

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 30), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await queueAPI.leaveQueue({ token, restaurant_id: restaurantId });
      localStorage.removeItem('queueToken');
      localStorage.removeItem('queueRestaurantId');
      toast('You have left the queue', 'info');
      navigate('/customer/home');
    } catch { toast('Failed to leave queue', 'error'); }
    finally { setLeaving(false); }
  };

  const goHome = () => navigate('/customer/home');
  const handleLogout = async () => { await logout(); navigate('/login'); };

  // ── loading ──
  if (loading) return (
    <PageWrapper>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16 }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <p className="text-muted">Fetching your status...</p>
      </div>
    </PageWrapper>
  );

  if (!data) return null;

  const { queue_entry: entry, position, people_ahead, dining_info } = data;
  const isActive = ['waiting', 'called'].includes(entry?.status);
  const progress = position > 0 ? Math.max(5, 100 - (people_ahead / (people_ahead + 1)) * 100) : 100;

  // Personalised seated message
  const tablePart = dining_info?.table_number ? ` Please proceed to Table ${dining_info.table_number}.` : '';
  const seatedMessage = `Welcome! Your table is ready.${tablePart} Enjoy your meal!`;

  // Clean address — hide placeholder values
  const address = !isPlaceholder(dining_info?.restaurant_address)
    ? dining_info?.restaurant_address
    : 'Restaurant address not available.';

  return (
    <PageWrapper>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px', minHeight: '100vh' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <p className="text-muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
              {entry?.status === 'seated' ? 'Dining Details' : 'Queue Status'}
            </p>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              {dining_info?.restaurant_name ?? 'Your Visit'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {isActive && (
              <button onClick={() => fetchStatus(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 8, borderRadius: 8, animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }}>
                <HiRefresh size={20} />
              </button>
            )}
            <button onClick={handleLogout}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 8, borderRadius: 8 }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--color-error)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
              <HiLogout size={20} />
            </button>
          </div>
        </div>

        {/* ── Progress Stepper ── */}
        <ProgressStepper status={entry?.status} calledAt={entry?.called_at} />

        {/* ── Token + badge ── */}
        <div className="card text-center anim-scale-in" style={{ marginBottom: 16 }}>
          <p className="text-muted text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Your Token</p>
          <p className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, marginBottom: 12 }}>
            {entry?.token_number}
          </p>
          <span className={`badge ${STATUS_BADGE[entry?.status] ?? 'badge-waiting'}`}>
            {STATUS_LABELS[entry?.status] ?? entry?.status}
          </span>
        </div>

        {/* ── WAITING ── */}
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

        {/* ── CALLED ── */}
        {entry?.status === 'called' && (
          <div className="card text-center anim-scale-in" style={{ marginBottom: 24, borderColor: 'rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.08)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📢</div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 8 }}>Your table is ready!</h3>
            <p className="text-muted text-sm">Please come to the restaurant within 10 minutes.</p>
          </div>
        )}

        {/* ── SEATED — dining confirmation ── */}
        {entry?.status === 'seated' && (
          <div className="anim-fade-up">

            {/* Success banner */}
            <div className="card text-center" style={{ marginBottom: 16, borderColor: 'rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.07)', padding: '28px 24px' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
              <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: 10, lineHeight: 1.4 }}>
                Your table is ready!
              </h2>
              <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {seatedMessage}
              </p>
            </div>

            {/* Booking details */}
            <div className="card" style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                Booking Details
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <DetailCell label="Token"      value={entry.token_number}                                                accent />
                <DetailCell label="Table"      value={dining_info?.table_number ? `Table ${dining_info.table_number}` : '—'} accent />
                <DetailCell label="Guest"      value={entry.customer_name} />
                <DetailCell label="Party Size" value={`${entry.party_size} ${entry.party_size === 1 ? 'person' : 'people'}`} />
                <DetailCell label="Arrived"    value={formatTime(entry.joined_at)} />
                <DetailCell label="Seated"     value={formatTime(dining_info?.assigned_at)} />
              </div>
              {dining_info?.assigned_at && entry.joined_at && (
                <div style={{ paddingTop: 12, borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Total wait time</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {calcWait(entry.joined_at, dining_info.assigned_at)}
                  </span>
                </div>
              )}
            </div>

            {/* Restaurant info */}
            {dining_info && (
              <div className="card" style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                  Restaurant
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <HiOfficeBuilding size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>{dining_info.restaurant_name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <HiLocationMarker size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 2 }} />
                    <span className="text-muted text-sm">{address}</span>
                  </div>
                  {dining_info.restaurant_phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <HiPhone size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                      <span className="text-muted text-sm">{dining_info.restaurant_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button onClick={goHome}>
                My Visit — Back to Dashboard
              </Button>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-bg-input)', border: '1px solid var(--color-border)',
              }}>
                <HiChat size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                  Feedback becomes available once your visit is complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── DONE states ── */}
        {['completed', 'no_show', 'left'].includes(entry?.status) && (
          <div className="card text-center anim-scale-in" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {entry?.status === 'completed' ? '✅' : entry?.status === 'no_show' ? '⏰' : '👋'}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: 16 }}>
              {entry?.status === 'completed' ? 'Visit complete!' : entry?.status === 'no_show' ? 'Marked as no-show' : 'Left queue'}
            </h3>
            {entry?.status === 'completed' && (
              <div style={{ marginBottom: 16 }}>
                {dining_info?.has_feedback ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', color: '#22c55e', fontWeight: 600, fontSize: '0.9375rem' }}>
                    <HiCheckCircle size={18} /> Thank you for your feedback!
                  </div>
                ) : (
                  <Button variant="ghost" onClick={() => navigate('/customer/feedback')}>
                    <HiChat size={16} /> Leave Feedback
                  </Button>
                )}
              </div>
            )}
            <Button onClick={() => { localStorage.removeItem('queueToken'); localStorage.removeItem('queueRestaurantId'); goHome(); }}>
              Back to Dashboard
            </Button>
          </div>
        )}

        {/* Auto-refresh hint */}
        {isActive && (
          <p className="text-center text-subtle text-xs" style={{ marginBottom: 16 }}>
            Auto-refreshing in {countdown}s
          </p>
        )}

        {/* Leave queue */}
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
                <p className="text-muted text-sm" style={{ marginBottom: 24 }}>
                  You'll lose your position and token. This cannot be undone.
                </p>
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

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiUsers, HiClock, HiTable, HiLogout, HiArrowRight, HiCheckCircle } from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { restaurantAPI, queueAPI } from '../../api/axios';

const STATUS_META = {
  waiting: { label: 'Waiting',        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
  called:  { label: 'Called — Go Now!', color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)'  },
  seated:  { label: 'Seated',          color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)'   },
};

export default function CustomerHome() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeQueue, setActiveQueue]     = useState(null);   // null=loading, false=none, obj=active
  const [restaurants, setRestaurants]     = useState([]);
  const [listLoading, setListLoading]     = useState(true);
  const [selectedRestaurant, setSelected] = useState(null);
  const [restaurantDetail, setDetail]     = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 1. Check active queue — single source of truth
  useEffect(() => {
    queueAPI.myActiveQueue()
      .then(res => {
        const d = res.data;
        if (d.has_active_queue) {
          localStorage.setItem('queueToken', d.token_number);
          localStorage.setItem('queueRestaurantId', String(d.restaurant_id));
          setActiveQueue(d);
        } else {
          setActiveQueue(false);
        }
      })
      .catch(() => setActiveQueue(false));
  }, []);

  // 2. Restaurant list — only when no active queue
  useEffect(() => {
    if (activeQueue !== false) return;
    restaurantAPI.getList()
      .then(res => setRestaurants(res.data))
      .catch(() => setRestaurants([]))
      .finally(() => setListLoading(false));
  }, [activeQueue]);

  // 3. Restaurant detail on selection
  useEffect(() => {
    if (!selectedRestaurant) { setDetail(null); return; }
    setDetailLoading(true);
    restaurantAPI.getDetail(selectedRestaurant.id)
      .then(res => setDetail(res.data))
      .catch(() => setDetail(null))
      .finally(() => setDetailLoading(false));
  }, [selectedRestaurant]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const stats = selectedRestaurant && restaurantDetail ? [
    { icon: HiClock, label: 'Avg Wait',  value: `${restaurantDetail.avg_meal_duration_mins}m`, color: '#60a5fa' },
    { icon: HiTable, label: 'Available', value: restaurantDetail.available_tables,              color: '#4ade80' },
    { icon: HiUsers, label: 'Occupied',  value: restaurantDetail.occupied_tables,               color: '#f97316' },
  ] : null;

  if (activeQueue === null) {
    return (
      <PageWrapper>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      </PageWrapper>
    );
  }

  const meta = activeQueue ? (STATUS_META[activeQueue.status] ?? STATUS_META.waiting) : null;

  return (
    <PageWrapper>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <p className="text-muted text-sm">Welcome back 👋</p>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.name}</h1>
          </div>
          <button onClick={handleLogout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 8, borderRadius: 8 }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--color-error)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
            <HiLogout size={20} />
          </button>
        </div>

        {/* ── ACTIVE VISIT CARD ── */}
        {activeQueue && meta && (
          <div className="card anim-scale-in" style={{ marginBottom: 24, borderColor: meta.border, background: meta.bg, padding: '20px 24px' }}>

            {/* Card header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiCheckCircle size={18} style={{ color: meta.color }} />
                <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                  Active Visit
                </span>
              </div>
              {/* Status pill */}
              <span style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                fontSize: '0.6875rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                background: meta.bg, color: meta.color,
                border: `1px solid ${meta.border}`,
              }}>
                {meta.label}
              </span>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <ActiveCell label="Restaurant" value={activeQueue.restaurant_name} />
              <ActiveCell label="Token"      value={activeQueue.token_number} accent />
              {activeQueue.status === 'seated' && activeQueue.table_number && (
                <ActiveCell label="Table" value={`Table ${activeQueue.table_number}`} accent />
              )}
              <ActiveCell label="Party" value={`${activeQueue.party_size ?? '—'} ${activeQueue.party_size === 1 ? 'person' : 'people'}`} />
            </div>

            <Button onClick={() => navigate('/customer/status')}>
              <HiArrowRight size={16} />
              {activeQueue.status === 'seated' ? 'View Dining Details' : 'View Queue Status'}
            </Button>
          </div>
        )}

        {/* ── JOIN QUEUE FLOW — hidden while active queue exists ── */}
        {!activeQueue && (
          <>
            <div className="card anim-fade-up" style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.9375rem' }}>🍽️ Choose a restaurant</p>
              {listLoading ? (
                <div className="skeleton" style={{ height: 44, borderRadius: 'var(--radius-md)' }} />
              ) : restaurants.length === 0 ? (
                <p className="text-muted text-sm">No active restaurants available.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {restaurants.map(r => {
                    const sel = selectedRestaurant?.id === r.id;
                    return (
                      <button key={r.id} onClick={() => setSelected({ id: r.id, name: r.name, address: r.address })}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', borderRadius: 'var(--radius-md)',
                          border: `2px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: sel ? 'var(--color-primary-muted)' : 'var(--color-bg-input)',
                          cursor: 'pointer', textAlign: 'left', width: '100%',
                          transition: 'var(--transition)', fontFamily: 'var(--font-sans)',
                        }}>
                        <div>
                          <p style={{ fontWeight: 600, color: sel ? 'var(--color-primary)' : 'var(--color-text)', fontSize: '0.9375rem' }}>{r.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{r.address}</p>
                        </div>
                        {sel && <span style={{ color: 'var(--color-primary)', fontSize: '1.25rem', marginLeft: 8 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedRestaurant && (
              detailLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }}>
                  {[0, 1, 2].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
                </div>
              ) : stats ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }}>
                  {stats.map((s, i) => (
                    <div key={s.label} className="stat-card anim-fade-up" style={{ animationDelay: `${i * 0.07}s` }}>
                      <s.icon size={20} style={{ color: s.color }} />
                      <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
                      <span className="stat-label">{s.label}</span>
                    </div>
                  ))}
                </div>
              ) : null
            )}

            <div className="card text-center anim-fade-up" style={{ animationDelay: '0.2s' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎫</div>
              {selectedRestaurant ? (
                <>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 4 }}>Ready to join the queue?</h3>
                  <p className="text-muted text-sm" style={{ marginBottom: 24 }}>
                    Skip the wait at <strong style={{ color: 'var(--color-primary)' }}>{selectedRestaurant.name}</strong>.
                  </p>
                  <Button onClick={() => navigate('/customer/join', { state: { restaurant: selectedRestaurant } })}>
                    Join Queue
                  </Button>
                </>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Select a restaurant above</h3>
                  <p className="text-muted text-sm">Choose a restaurant to see queue details and join.</p>
                </>
              )}
            </div>
          </>
        )}

      </div>
    </PageWrapper>
  );
}

function ActiveCell({ label, value, accent }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
      <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: 3 }}>{label}</p>
      <p style={{ fontWeight: accent ? 800 : 600, fontSize: accent ? '1rem' : '0.875rem', color: accent ? 'var(--color-primary)' : 'var(--color-text)' }}>
        {value ?? '—'}
      </p>
    </div>
  );
}

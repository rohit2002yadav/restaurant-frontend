import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiUsers, HiClock, HiTable, HiLogout } from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { restaurantAPI, queueAPI } from '../../api/axios';
import { RESTAURANT_ID } from '../../utils/constants';

export default function CustomerHome() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [queueCount, setQueueCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('queueToken')) { navigate('/customer/status'); return; }
    Promise.all([
      restaurantAPI.getDetail(RESTAURANT_ID),
      queueAPI.getRestaurantQueue(RESTAURANT_ID).catch(() => ({ data: [] })),
    ]).then(([r, q]) => {
      setRestaurant(r.data);
      setQueueCount(Array.isArray(q.data) ? q.data.length : 0);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [navigate]);

  const stats = [
    { icon: HiUsers, label: 'In Queue',  value: queueCount ?? '—',                                          color: '#f97316' },
    { icon: HiClock, label: 'Avg Wait',  value: restaurant ? `${restaurant.avg_meal_duration_mins}m` : '—', color: '#60a5fa' },
    { icon: HiTable, label: 'Available', value: restaurant ? restaurant.available_tables : '—',             color: '#4ade80' },
  ];

  return (
    <PageWrapper>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <p className="text-muted text-sm">Welcome back 👋</p>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.name}</h1>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 8, borderRadius: 8 }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--color-error)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
            <HiLogout size={20} />
          </button>
        </div>

        {/* Restaurant Banner */}
        <div className="card anim-fade-up" style={{
          marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))',
          borderColor: 'rgba(249,115,22,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(135deg, #f97316, #ea6c0a)',
              boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
            }}>🍽️</div>
            <div>
              {loading
                ? <div className="skeleton" style={{ height: 20, width: 140, marginBottom: 6 }} />
                : <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 2 }}>{restaurant?.name ?? 'Restaurant'}</h2>
              }
              <p className="text-muted text-sm">{loading ? 'Loading...' : (restaurant?.address ?? '')}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={s.label} className="stat-card anim-fade-up" style={{ animationDelay: `${i*0.07}s` }}>
              <s.icon size={20} style={{ color: s.color }} />
              <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="card text-center anim-fade-up" style={{ animationDelay: '0.2s' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎫</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>Ready to join the queue?</h3>
          <p className="text-muted text-sm" style={{ marginBottom: 24 }}>
            Skip the wait. Join virtually and get notified when your table is ready.
          </p>
          <Button onClick={() => navigate('/customer/join')}>Join Queue</Button>
        </div>

      </div>
    </PageWrapper>
  );
}

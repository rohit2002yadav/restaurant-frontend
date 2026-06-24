import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiUsers, HiClock, HiTable, HiLogout } from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { restaurantAPI, queueAPI } from '../../api/axios';

export default function CustomerHome() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [restaurants, setRestaurants]         = useState([]);    // list from API
  const [listLoading, setListLoading]         = useState(true);
  const [selectedRestaurant, setSelected]     = useState(null);  // { id, name, address }
  const [restaurantDetail, setDetail]         = useState(null);  // detail + stats
  const [detailLoading, setDetailLoading]     = useState(false);

  // Redirect if already in a queue
  useEffect(() => {
    if (localStorage.getItem('queueToken')) {
      navigate('/customer/status');
    }
  }, [navigate]);

  // Fetch active restaurant list on mount — no auto-selection
  useEffect(() => {
    restaurantAPI.getList()
      .then(res => setRestaurants(res.data))
      .catch(() => setRestaurants([]))
      .finally(() => setListLoading(false));
  }, []);

  // When selection changes, fetch that restaurant's detail + queue count
  useEffect(() => {
    if (!selectedRestaurant) { setDetail(null); return; }
    setDetailLoading(true);
    Promise.all([
      restaurantAPI.getDetail(selectedRestaurant.id),
      queueAPI.getRestaurantQueue(selectedRestaurant.id).catch(() => ({ data: [] })),
    ]).then(([r, q]) => {
      setDetail({
        ...r.data,
        queue_count: Array.isArray(q.data) ? q.data.length : 0,
      });
    }).catch(() => setDetail(null))
    .finally(() => setDetailLoading(false));
  }, [selectedRestaurant]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const handleSelect = (r) => {
    setSelected({ id: r.id, name: r.name, address: r.address });
  };

  const handleJoin = () => {
    navigate('/customer/join', {
      state: { restaurant: selectedRestaurant },
    });
  };

  const stats = selectedRestaurant && restaurantDetail ? [
    { icon: HiUsers, label: 'In Queue',  value: restaurantDetail.queue_count,              color: '#f97316' },
    { icon: HiClock, label: 'Avg Wait',  value: `${restaurantDetail.avg_meal_duration_mins}m`, color: '#60a5fa' },
    { icon: HiTable, label: 'Available', value: restaurantDetail.available_tables,          color: '#4ade80' },
  ] : null;

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

        {/* Restaurant selector */}
        <div className="card anim-fade-up" style={{ marginBottom: 20 }}>
          <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.9375rem' }}>
            🍽️ Choose a restaurant
          </p>

          {listLoading ? (
            <div className="skeleton" style={{ height: 44, borderRadius: 'var(--radius-md)' }} />
          ) : restaurants.length === 0 ? (
            <p className="text-muted text-sm">No active restaurants available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {restaurants.map(r => {
                const isSelected = selectedRestaurant?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: isSelected ? 'var(--color-primary-muted)' : 'var(--color-bg-input)',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'var(--transition)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 600, color: isSelected ? 'var(--color-primary)' : 'var(--color-text)', fontSize: '0.9375rem' }}>
                        {r.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {r.address}
                      </p>
                    </div>
                    {isSelected && (
                      <span style={{ color: 'var(--color-primary)', fontSize: '1.25rem', marginLeft: 8 }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats — only shown after selection */}
        {selectedRestaurant && (
          detailLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }}>
              {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
            </div>
          ) : stats ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }}>
              {stats.map((s, i) => (
                <div key={s.label} className="stat-card anim-fade-up" style={{ animationDelay: `${i*0.07}s` }}>
                  <s.icon size={20} style={{ color: s.color }} />
                  <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          ) : null
        )}

        {/* CTA — only active after selection */}
        <div className="card text-center anim-fade-up" style={{ animationDelay: '0.2s' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎫</div>
          {selectedRestaurant ? (
            <>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 4 }}>
                Ready to join the queue?
              </h3>
              <p className="text-muted text-sm" style={{ marginBottom: 24 }}>
                Skip the wait at <strong style={{ color: 'var(--color-primary)' }}>{selectedRestaurant.name}</strong>.
              </p>
              <Button onClick={handleJoin}>Join Queue</Button>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 8 }}>
                Select a restaurant above
              </h3>
              <p className="text-muted text-sm">
                Choose a restaurant to see queue details and join.
              </p>
            </>
          )}
        </div>

      </div>
    </PageWrapper>
  );
}

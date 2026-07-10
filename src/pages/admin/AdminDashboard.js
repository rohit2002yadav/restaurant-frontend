import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiUsers, HiTable, HiPhone, HiCheckCircle,
  HiRefresh, HiLogout, HiClock, HiUserGroup, HiCog,
} from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../context/AuthContext';
import { queueAPI, restaurantAPI } from '../../api/axios';
import { toast } from '../../components/ui/Toast';

/* ── helpers ── */
function timeAgo(isoString) {
  if (!isoString) return '—';
  const mins = Math.floor((Date.now() - new Date(isoString)) / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

/* ── sub-components ── */
function StatCard({ icon: Icon, label, value, color, border, bg }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 6, padding: '18px 12px',
      background: bg, border: `1px solid ${border}`,
      borderRadius: 'var(--radius-lg)', textAlign: 'center',
    }}>
      <Icon size={22} style={{ color }} />
      <span style={{ fontSize: '1.875rem', fontWeight: 800, lineHeight: 1, color }}>{value}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

function WaitingCard({ entry, onCall, actionLoading }) {
  const busy = actionLoading === `call-${entry.id}`;
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', marginBottom: 8 }}>
      {/* Token */}
      <div style={{
        minWidth: 56, height: 56, borderRadius: 'var(--radius-md)',
        background: 'var(--color-primary-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.8125rem' }}>{entry.token_number}</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.customer_name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <HiUserGroup size={12} /> Party of {entry.party_size}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <HiClock size={12} /> ~{entry.estimated_wait_mins ?? 0}m wait
          </span>
        </div>
      </div>

      {/* Call button */}
      <button
        onClick={() => onCall(entry.id, entry.customer_name)}
        disabled={!!actionLoading}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem', fontWeight: 600, flexShrink: 0,
          background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
          border: '1px solid rgba(59,130,246,0.25)', cursor: 'pointer',
          opacity: actionLoading ? 0.5 : 1, transition: 'var(--transition)',
        }}
      >
        {busy
          ? <span className="btn-spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
          : <HiPhone size={13} />}
        Call
      </button>
    </div>
  );
}

function TableCard({ assignment, onClear, onSeat, actionLoading }) {
  const busy      = actionLoading === `clear-${assignment.id}`;
  const seatBusy  = actionLoading === `seat-${assignment.queue_entry_id}`;
  const isCalled  = assignment.entry_status === 'called';
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', marginBottom: 8 }}>
      {/* Table number */}
      <div style={{
        minWidth: 56, height: 56, borderRadius: 'var(--radius-md)',
        background: 'rgba(34,197,94,0.1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, gap: 2,
      }}>
        <span style={{ color: '#4ade80', fontWeight: 800, fontSize: '0.875rem' }}>{assignment.table_number}</span>
        <span style={{ color: 'var(--color-text-subtle)', fontSize: '0.625rem' }}>{assignment.table_capacity} seats</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {assignment.customer_name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>{assignment.token_number}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <HiUserGroup size={12} /> Party of {assignment.party_size}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <HiClock size={12} /> {timeAgo(assignment.assigned_at)}
          </span>
        </div>
      </div>

      {/* Status + Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <span className={`badge ${isCalled ? 'badge-called' : 'badge-seated'}`}>
          {isCalled ? 'Called' : 'Seated'}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {isCalled && (
            <button
              onClick={() => onSeat(assignment.queue_entry_id, assignment.customer_name)}
              disabled={!!actionLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem', fontWeight: 600,
                background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
                border: '1px solid rgba(59,130,246,0.25)', cursor: 'pointer',
                opacity: actionLoading ? 0.5 : 1, transition: 'var(--transition)',
              }}
            >
              {seatBusy
                ? <span className="btn-spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                : <HiCheckCircle size={13} />}
              Seat
            </button>
          )}
          <button
            onClick={() => onClear(assignment.id, assignment.table_number)}
            disabled={!!actionLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem', fontWeight: 600,
              background: 'rgba(34,197,94,0.12)', color: '#4ade80',
              border: '1px solid rgba(34,197,94,0.25)', cursor: 'pointer',
              opacity: actionLoading ? 0.5 : 1, transition: 'var(--transition)',
            }}
          >
            {busy
              ? <span className="btn-spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
              : <HiCheckCircle size={13} />}
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, color, title, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 'var(--radius-sm)',
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} style={{ color }} />
      </div>
      <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>{title}</h2>
      <span style={{
        marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700,
        background: `${color}18`, color, padding: '2px 10px',
        borderRadius: 'var(--radius-full)', border: `1px solid ${color}30`,
      }}>{count}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="card" style={{ padding: '36px 24px', textAlign: 'center' }}>
      <Icon size={36} style={{ color: 'var(--color-text-subtle)', margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>{message}</p>
    </div>
  );
}

/* ── main component ── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const restaurantId = user?.restaurant_id;

  const [dashboard, setDashboard]         = useState({ waiting_queue: [], active_tables: [] });
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [countdown, setCountdown]         = useState(20);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!restaurantId) return;
    if (!silent) setLoading(true);
    try {
      const [dashRes, restRes] = await Promise.all([
        queueAPI.staffDashboard(restaurantId),
        restaurantAPI.getDetail(restaurantId),
      ]);
      setDashboard(dashRes.data);
      setRestaurantInfo(restRes.data);
    } catch {
      toast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => {
    const interval = setInterval(() => { fetchDashboard(true); setCountdown(20); }, 20000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);
  useEffect(() => {
    const t = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 20), 1000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const handleCall = async (queueEntryId, customerName) => {
    setActionLoading(`call-${queueEntryId}`);
    try {
      await queueAPI.callCustomer({ queue_entry_id: queueEntryId });
      toast(`Called ${customerName}!`, 'success');
      fetchDashboard(true);
    } catch (err) {
      toast(err.response?.data?.error ?? 'Failed to call customer', 'error');
    } finally { setActionLoading(null); }
  };

  const handleSeat = async (queueEntryId, customerName) => {
    setActionLoading(`seat-${queueEntryId}`);
    try {
      await queueAPI.seatCustomer({ queue_entry_id: queueEntryId });
      toast(`${customerName} seated!`, 'success');
      fetchDashboard(true);
    } catch (err) {
      toast(err.response?.data?.error ?? 'Failed to seat customer', 'error');
    } finally { setActionLoading(null); }
  };

  const handleClear = async (assignmentId, tableNumber) => {
    setActionLoading(`clear-${assignmentId}`);
    try {
      await queueAPI.clearTable({ table_assignment_id: assignmentId });
      toast(`Table ${tableNumber} cleared!`, 'success');
      fetchDashboard(true);
    } catch (err) {
      toast(err.response?.data?.error ?? 'Failed to clear table', 'error');
    } finally { setActionLoading(null); }
  };

  const { waiting_queue, active_tables } = dashboard;
  const totalTables    = restaurantInfo ? (restaurantInfo.available_tables + restaurantInfo.occupied_tables) : '—';
  const availableTables = restaurantInfo?.available_tables ?? '—';

  const stats = [
    { icon: HiUsers,  label: 'Waiting',   value: waiting_queue.length, color: '#f97316', border: 'rgba(249,115,22,0.2)',  bg: 'rgba(249,115,22,0.06)'  },
    { icon: HiTable,  label: 'Occupied',  value: active_tables.length, color: '#f87171', border: 'rgba(239,68,68,0.2)',   bg: 'rgba(239,68,68,0.06)'   },
    { icon: HiCheckCircle, label: 'Available', value: availableTables, color: '#4ade80', border: 'rgba(34,197,94,0.2)',   bg: 'rgba(34,197,94,0.06)'   },
    { icon: HiTable,  label: 'Total Tables', value: totalTables,       color: '#60a5fa', border: 'rgba(59,130,246,0.2)',  bg: 'rgba(59,130,246,0.06)'  },
  ];

  return (
    <PageWrapper>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 64px', minHeight: '100vh' }}>

        {/* ── Header ── */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, padding: '18px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg,#f97316,#ea6c0a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>🍽️</div>
            <div>
              <h1 style={{ fontSize: '1.125rem', fontWeight: 800, lineHeight: 1.2 }}>
                {user?.restaurant_name ?? 'Restaurant'}
              </h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 3 }}>
                Staff: <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{user?.name}</span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>Refreshes in {countdown}s</span>
            <button
              onClick={() => navigate('/admin/tables')}
              title="Manage Tables"
              style={{ background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '8px 10px', transition: 'var(--transition)' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--color-primary)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              <HiCog size={18} />
            </button>
            <button
              onClick={() => fetchDashboard(true)}
              title="Refresh"
              style={{ background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '8px 10px', transition: 'var(--transition)' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--color-text)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              <HiRefresh size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{ background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '8px 10px', transition: 'var(--transition)' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--color-error)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              <HiLogout size={18} />
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          {stats.map((s, i) => (
            <div key={s.label} className="anim-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <StatCard {...s} />
            </div>
          ))}
        </div>

        {/* ── Waiting Queue ── */}
        <div style={{ marginBottom: 28 }}>
          <SectionHeader icon={HiUsers} color="#f97316" title="Waiting Queue" count={waiting_queue.length} />
          {loading
            ? [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72, marginBottom: 8, borderRadius: 'var(--radius-xl)' }} />)
            : waiting_queue.length === 0
              ? <EmptyState icon={HiUsers} message="No customers are currently waiting." />
              : waiting_queue.map(entry => (
                  <WaitingCard key={entry.id} entry={entry} onCall={handleCall} actionLoading={actionLoading} />
                ))
          }
        </div>

        {/* ── Active Tables ── */}
        <div>
          <SectionHeader icon={HiTable} color="#4ade80" title="Active Tables" count={active_tables.length} />
          {loading
            ? [...Array(2)].map((_, i) => <div key={i} className="skeleton" style={{ height: 84, marginBottom: 8, borderRadius: 'var(--radius-xl)' }} />)
            : active_tables.length === 0
              ? <EmptyState icon={HiTable} message="No active tables at the moment." />
              : active_tables.map(assignment => (
                  <TableCard key={assignment.id} assignment={assignment} onCall={handleCall} onClear={handleClear} onSeat={handleSeat} actionLoading={actionLoading} />
                ))
          }
        </div>

      </div>
    </PageWrapper>
  );
}

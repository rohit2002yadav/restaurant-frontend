import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiUsers, HiTable, HiPhone, HiCheckCircle, HiRefresh, HiLogout, HiClock } from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../context/AuthContext';
import { queueAPI } from '../../api/axios';
import { toast } from '../../components/ui/Toast';
import { STATUS_LABELS } from '../../utils/constants';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const restaurantId = user?.restaurant_id;

  const [dashboard, setDashboard]     = useState({ waiting_queue: [], active_tables: [] });
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!restaurantId) return;
    if (!silent) setLoading(true);
    try {
      const res = await queueAPI.staffDashboard(restaurantId);
      setDashboard(res.data);
    } catch {
      toast('Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => {
    const interval = setInterval(() => fetchDashboard(true), 20000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

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

  const stats = [
    { icon: HiUsers, label: 'Waiting',     value: waiting_queue.length,                       color: '#f97316', border: 'rgba(249,115,22,0.2)',  bg: 'rgba(249,115,22,0.08)' },
    { icon: HiTable, label: 'Occupied',    value: active_tables.length,                       color: '#f87171', border: 'rgba(239,68,68,0.2)',    bg: 'rgba(239,68,68,0.08)'  },
    { icon: HiClock, label: 'Total Active',value: waiting_queue.length + active_tables.length, color: '#60a5fa', border: 'rgba(59,130,246,0.2)',   bg: 'rgba(59,130,246,0.08)' },
  ];

  return (
    <PageWrapper>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 16px', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <p className="text-muted text-sm">Staff Dashboard 👨💼</p>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.name}</h1>
            {user?.restaurant_name && <p className="text-muted text-sm">{user.restaurant_name}</p>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => fetchDashboard(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 8, borderRadius: 8 }}>
              <HiRefresh size={20} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <button onClick={() => { logout(); navigate('/login'); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 8, borderRadius: 8 }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--color-error)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
              <HiLogout size={20} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={s.label} className="stat-card anim-fade-up"
              style={{ border: `1px solid ${s.border}`, background: s.bg, animationDelay: `${i*0.07}s` }}>
              <s.icon size={20} style={{ color: s.color }} />
              <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Waiting Queue */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiUsers style={{ color: '#f97316' }} /> Waiting Queue ({waiting_queue.length})
          </h2>

          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64, marginBottom: 8 }} />)
          ) : waiting_queue.length === 0 ? (
            <div className="card text-center" style={{ padding: 32, color: 'var(--color-text-subtle)' }}>
              <HiUsers size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p>No one waiting right now</p>
            </div>
          ) : (
            waiting_queue.map(entry => (
              <div key={entry.id} className="card anim-fade-up"
                style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                <div style={{ width: 56, textAlign: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#f97316', fontWeight: 700, fontSize: '0.875rem' }}>{entry.token_number}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.customer?.name}</p>
                  <p className="text-subtle text-xs">Party of {entry.party_size} · ~{entry.estimated_wait_mins}m wait</p>
                </div>
                {entry.priority === 'vip' && <span className="badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>VIP</span>}
                <button
                  onClick={() => handleCall(entry.id, entry.customer?.name)}
                  disabled={!!actionLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                    background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                    border: '1px solid rgba(59,130,246,0.3)', cursor: 'pointer',
                    opacity: actionLoading ? 0.5 : 1,
                  }}>
                  {actionLoading === `call-${entry.id}`
                    ? <span className="btn-spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                    : <HiPhone size={12} />}
                  Call
                </button>
              </div>
            ))
          )}
        </div>

        {/* Active Tables */}
        <div>
          <h2 style={{ fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiTable style={{ color: '#f87171' }} /> Active Tables ({active_tables.length})
          </h2>

          {loading ? (
            [...Array(2)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64, marginBottom: 8 }} />)
          ) : active_tables.length === 0 ? (
            <div className="card text-center" style={{ padding: 32, color: 'var(--color-text-subtle)' }}>
              <HiTable size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p>No tables occupied</p>
            </div>
          ) : (
            active_tables.map(assignment => (
              <div key={assignment.id} className="card anim-fade-up"
                style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                <div style={{ width: 56, textAlign: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.875rem' }}>{assignment.table_unit?.table_number}</span>
                  <p className="text-subtle text-xs">{assignment.table_unit?.capacity} seats</p>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {assignment.queue_entry?.customer?.name}
                  </p>
                  <p className="text-subtle text-xs">Token: {assignment.queue_entry?.token_number} · Party of {assignment.queue_entry?.party_size}</p>
                </div>
                <span className={`badge badge-${assignment.queue_entry?.status ?? 'seated'}`}>
                  {STATUS_LABELS[assignment.queue_entry?.status] ?? 'Seated'}
                </span>
                <button
                  onClick={() => handleClear(assignment.id, assignment.table_unit?.table_number)}
                  disabled={!!actionLoading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                    background: 'rgba(34,197,94,0.15)', color: '#4ade80',
                    border: '1px solid rgba(34,197,94,0.3)', cursor: 'pointer',
                    opacity: actionLoading ? 0.5 : 1,
                  }}>
                  {actionLoading === `clear-${assignment.id}`
                    ? <span className="btn-spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                    : <HiCheckCircle size={12} />}
                  Clear
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

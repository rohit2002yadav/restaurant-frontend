import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiTable, HiPencil, HiTrash, HiCheck, HiX, HiArrowLeft, HiPlus } from 'react-icons/hi';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { restaurantAPI } from '../../api/axios';
import { toast } from '../../components/ui/Toast';

const STATUS_STYLE = {
  available: { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', label: 'Available' },
  occupied:  { bg: 'rgba(239,68,68,0.12)',  color: '#f87171', label: 'Occupied'  },
  reserved:  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Reserved'  },
  cleaning:  { bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', label: 'Cleaning'  },
  inactive:  { bg: 'rgba(100,116,139,0.12)',color: '#64748b', label: 'Inactive'  },
};

export default function TableManagement() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const restaurantId = user?.restaurant_id;

  const [tables, setTables]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editId, setEditId]       = useState(null);   // table id being edited
  const [editCap, setEditCap]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(null);   // table id being deleted

  // Add new table state
  const [showAdd, setShowAdd]     = useState(false);
  const [newCap, setNewCap]       = useState(4);
  const [adding, setAdding]       = useState(false);

  const fetchTables = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await restaurantAPI.getTables(restaurantId);
      setTables(res.data);
    } catch {
      toast('Failed to load tables', 'error');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const handleEditSave = async (tableId) => {
    const cap = parseInt(editCap, 10);
    if (isNaN(cap) || cap < 1 || cap > 20) {
      toast('Capacity must be between 1 and 20', 'error');
      return;
    }
    setSaving(true);
    try {
      await restaurantAPI.updateTable(tableId, cap);
      toast('Capacity updated', 'success');
      setEditId(null);
      fetchTables();
    } catch (err) {
      toast(err.response?.data?.error ?? 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tableId, tableNumber) => {
    setDeleting(tableId);
    try {
      await restaurantAPI.deleteTable(tableId);
      toast(`${tableNumber} deleted`, 'success');
      fetchTables();
    } catch (err) {
      toast(err.response?.data?.error ?? 'Delete failed', 'error');
    } finally {
      setDeleting(null); }
  };

  const handleAddTable = async () => {
    const cap = parseInt(newCap, 10);
    if (isNaN(cap) || cap < 1 || cap > 20) {
      toast('Capacity must be between 1 and 20', 'error');
      return;
    }
    setAdding(true);
    try {
      // Auto-generate next table number
      const nums = tables.map(t => parseInt(t.table_number.replace(/\D/g, ''), 10)).filter(Boolean);
      const next = nums.length ? Math.max(...nums) + 1 : 1;
      await restaurantAPI.bulkCreate(restaurantId, [{ table_number: `T${next}`, capacity: cap }]);
      toast(`T${next} added`, 'success');
      setShowAdd(false);
      setNewCap(4);
      fetchTables();
    } catch (err) {
      toast(err.response?.data?.error ?? 'Failed to add table', 'error');
    } finally {
      setAdding(false);
    }
  };

  const available = tables.filter(t => t.status === 'available').length;
  const occupied  = tables.filter(t => t.status === 'occupied').length;

  return (
    <PageWrapper>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px 64px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 4 }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--color-text)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            <HiArrowLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Table Management</h1>
            <p className="text-muted text-sm">{user?.restaurant_name}</p>
          </div>
          <button
            onClick={() => setShowAdd(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary)', color: '#fff',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              fontWeight: 600, fontSize: '0.875rem', boxShadow: 'var(--shadow-primary)',
            }}
          >
            <HiPlus size={16} /> Add Table
          </button>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total',     value: tables.length, color: '#60a5fa', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)'  },
            { label: 'Available', value: available,      color: '#4ade80', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)'   },
            { label: 'Occupied',  value: occupied,       color: '#f87171', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px 8px', textAlign: 'center', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add table inline form */}
        {showAdd && (
          <div className="card anim-fade-up" style={{ marginBottom: 16, padding: '16px 20px' }}>
            <p style={{ fontWeight: 600, marginBottom: 12, fontSize: '0.9375rem' }}>Add New Table</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, display: 'block', marginBottom: 4 }}>CAPACITY (SEATS)</label>
                <input
                  type="number" min={1} max={20} value={newCap}
                  onChange={e => setNewCap(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontWeight: 600, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button onClick={() => { setShowAdd(false); setNewCap(4); }}
                  style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                  <HiX size={16} />
                </button>
                <button onClick={handleAddTable} disabled={adding}
                  style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', border: 'none', color: '#fff', cursor: 'pointer', opacity: adding ? 0.6 : 1 }}>
                  {adding ? <span className="btn-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <HiCheck size={16} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table list */}
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64, marginBottom: 8, borderRadius: 'var(--radius-xl)' }} />)
        ) : tables.length === 0 ? (
          <div className="card text-center" style={{ padding: 40 }}>
            <HiTable size={36} style={{ color: 'var(--color-text-subtle)', margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
            <p className="text-muted">No tables found. Add your first table above.</p>
          </div>
        ) : (
          tables.map(table => {
            const s = STATUS_STYLE[table.status] ?? STATUS_STYLE.available;
            const isEditing = editId === table.id;
            return (
              <div key={table.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', marginBottom: 8 }}>
                {/* Table number */}
                <div style={{ minWidth: 52, height: 52, borderRadius: 'var(--radius-md)', background: 'var(--color-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.875rem' }}>{table.table_number}</span>
                </div>

                {/* Capacity — editable */}
                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <input
                      type="number" min={1} max={20}
                      value={editCap}
                      onChange={e => setEditCap(e.target.value)}
                      autoFocus
                      style={{ width: 80, padding: '6px 10px', background: 'var(--color-bg-input)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', fontWeight: 600, outline: 'none' }}
                    />
                  ) : (
                    <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{table.capacity} seats</p>
                  )}
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Capacity</p>
                </div>

                {/* Status badge */}
                <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: s.bg, color: s.color, fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
                  {s.label}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {isEditing ? (
                    <>
                      <button onClick={() => handleEditSave(table.id)} disabled={saving}
                        style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', cursor: 'pointer' }}>
                        {saving ? <span className="btn-spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : <HiCheck size={14} />}
                      </button>
                      <button onClick={() => setEditId(null)}
                        style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-hover)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                        <HiX size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(table.id); setEditCap(String(table.capacity)); }}
                        style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa', cursor: 'pointer' }}>
                        <HiPencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(table.id, table.table_number)}
                        disabled={table.status === 'occupied' || deleting === table.id}
                        title={table.status === 'occupied' ? 'Cannot delete occupied table' : 'Delete table'}
                        style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', cursor: table.status === 'occupied' ? 'not-allowed' : 'pointer', opacity: table.status === 'occupied' ? 0.4 : 1 }}>
                        {deleting === table.id ? <span className="btn-spinner" style={{ width: 12, height: 12, borderWidth: 2, borderTopColor: '#f87171' }} /> : <HiTrash size={14} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Back to dashboard */}
        {!loading && tables.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
              <HiArrowLeft size={16} /> Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

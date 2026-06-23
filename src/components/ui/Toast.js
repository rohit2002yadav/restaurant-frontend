import { useState, useEffect } from 'react';

function ToastItem({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  return (
    <div className={`toast toast-${type} anim-fade-up`}>
      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
}

let _setToasts = null;

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <ToastItem key={t.id} {...t} onClose={() => setToasts(p => p.filter(x => x.id !== t.id))} />
      ))}
    </div>
  );
}

export function toast(message, type = 'info') {
  if (_setToasts) {
    const id = Date.now();
    _setToasts(p => [...p, { id, message, type }]);
  }
}

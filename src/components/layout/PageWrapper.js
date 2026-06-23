import { useEffect } from 'react';

export default function PageWrapper({ children, className = '' }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <div className="page-bg" />
      <div className={`page-content ${className}`}>
        {children}
      </div>
    </div>
  );
}

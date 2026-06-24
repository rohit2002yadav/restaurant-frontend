import { useNavigate } from 'react-router-dom';
import { HiClock, HiUsers, HiBell, HiChartBar, HiCheckCircle, HiArrowRight } from 'react-icons/hi';

const S = {
  /* Layout helpers */
  page:    { minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)' },
  maxW6xl: { maxWidth: 1152, margin: '0 auto', padding: '0 24px' },
  maxW4xl: { maxWidth: 896,  margin: '0 auto', padding: '0 24px', textAlign: 'center' },
  maxW5xl: { maxWidth: 1024, margin: '0 auto', padding: '0 24px' },
  maxW3xl: { maxWidth: 768,  margin: '0 auto', padding: '0 24px', textAlign: 'center' },
};

const STATUS_COLORS = {
  Waiting: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  Called:  { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  Seated:  { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={S.page}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--color-bg-card)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ ...S.maxW6xl, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#f97316,#ea6c0a)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🍽️</div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>QueueEat</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => navigate('/login')} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '8px 16px', color: 'var(--color-text-muted)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 500, transition: 'var(--transition)' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--color-text)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
              Login
            </button>
            <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg,#f97316,#ea6c0a)', border: 'none', borderRadius: 'var(--radius-md)', padding: '8px 16px', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 600, boxShadow: 'var(--shadow-primary)', transition: 'var(--transition)' }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ paddingTop: 120, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div style={S.maxW4xl}>
          {/* Live badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--color-primary-muted)', color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 600, padding: '6px 16px', borderRadius: 'var(--radius-full)', marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, background: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 2s linear infinite', display: 'inline-block' }} />
            Live Queue Management
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.15, marginBottom: 24 }}>
            Skip the Waiting.<br />
            <span style={{ color: 'var(--color-primary)' }}>Join the Queue Digitally.</span>
          </h1>

          <p style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Track your restaurant queue position in real-time and know exactly when your table is ready. No more standing outside.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <button onClick={() => navigate('/register')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#f97316,#ea6c0a)', border: 'none', borderRadius: 'var(--radius-lg)', padding: '14px 28px', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1rem', boxShadow: 'var(--shadow-primary)', transition: 'var(--transition)' }}
              onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              Get Started <HiArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/login')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '14px 28px', color: 'var(--color-text)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '1rem', transition: 'var(--transition)' }}>
              Sign In
            </button>
          </div>
        </div>

        {/* Dashboard preview */}
        <div style={{ maxWidth: 700, margin: '64px auto 0', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', background: 'var(--color-bg-card)', backdropFilter: 'blur(16px)' }}>
          {/* Browser chrome */}
          <div style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            {['#f87171','#fbbf24','#4ade80'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
            <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>Queue Dashboard</span>
          </div>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, padding: '20px 20px 12px' }}>
            {[['12','Waiting'],['4','Seated'],['28 min','Avg Wait']].map(([val, label]) => (
              <div key={label} style={{ background: 'var(--color-primary-muted)', borderRadius: 'var(--radius-md)', padding: '14px 8px', textAlign: 'center' }}>
                <p style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--color-primary)' }}>{val}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>
          {/* Queue rows */}
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['T-001','Raj Kumar','2 guests','Waiting'],['T-002','Meera Singh','4 guests','Called'],['T-003','Vikram Patel','6 guests','Seated']].map(([token, name, guests, status]) => (
              <div key={token} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.875rem', minWidth: 52 }}>{token}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text)', flex: 1, paddingLeft: 8 }}>{name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', paddingRight: 12 }}>{guests}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: STATUS_COLORS[status].bg, color: STATUS_COLORS[status].color }}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section style={{ padding: '80px 24px', background: 'var(--color-bg-card)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={S.maxW5xl}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: 12 }}>How It Works</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 480, margin: '0 auto' }}>Three simple steps to skip the line and enjoy your meal stress-free.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { step: '01', icon: HiUsers,      title: 'Join Digitally',      desc: 'Scan the QR code at the entrance or register to join the queue from your phone.' },
              { step: '02', icon: HiClock,      title: 'Track in Real-Time',  desc: 'See your position, estimated wait time, and how many people are ahead of you.' },
              { step: '03', icon: HiBell,       title: 'Get Notified',        desc: 'Receive instant notification when your table is ready. No more waiting outside.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} style={{ position: 'relative', padding: 24, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)' }}>
                <span style={{ position: 'absolute', top: 16, right: 20, fontSize: '3rem', fontWeight: 900, color: 'var(--color-primary-muted)', lineHeight: 1 }}>{step}</span>
                <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#f97316,#ea6c0a)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: 'var(--shadow-primary)' }}>
                  <Icon size={22} style={{ color: '#fff' }} />
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={S.maxW5xl}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: 12 }}>Everything You Need</h2>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: 480, margin: '0 auto' }}>Powerful features for restaurants and customers alike.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { icon: HiClock,       title: 'Real-time Wait Time',       desc: 'Live estimated wait time updates for every customer.' },
              { icon: HiUsers,       title: 'Smart Queue Management',    desc: 'Best-fit table algorithm ensures no table is wasted.' },
              { icon: HiBell,        title: 'Instant Notifications',     desc: 'Customers are notified the moment their table is ready.' },
              { icon: HiChartBar,    title: 'Analytics Dashboard',       desc: 'Track queue stats, peak hours, and customer flow.' },
              { icon: HiCheckCircle, title: 'Auto No-Show Detection',    desc: 'System auto-handles no-shows and moves queue forward.' },
              { icon: () => <span style={{ fontSize: 18 }}>🍽️</span>, title: 'Multi-Table Support', desc: 'Manage multiple tables with different capacities easily.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ padding: 24, background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', transition: 'var(--transition)' }}>
                <div style={{ width: 40, height: 40, background: 'var(--color-primary-muted)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, color: 'var(--color-primary)' }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.9375rem' }}>{title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg, #f97316, #ea6c0a)' }}>
        <div style={S.maxW3xl}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>Ready to Eliminate the Wait?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: 32, fontSize: '1rem' }}>
            Join hundreds of restaurants already using QueueEat to manage their queues smarter.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            <button onClick={() => navigate('/register')}
              style={{ background: '#fff', border: 'none', borderRadius: 'var(--radius-lg)', padding: '14px 28px', color: '#f97316', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'var(--transition)' }}>
              Register Your Restaurant
            </button>
            <button onClick={() => navigate('/login')}
              style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 'var(--radius-lg)', padding: '14px 28px', color: '#fff', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'var(--transition)' }}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '40px 24px', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#f97316,#ea6c0a)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🍽️</div>
          <span style={{ fontWeight: 800, fontSize: '1rem' }}>QueueEat</span>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>© 2026 QueueEat. Built with ❤️ by Rohit Yadav.</p>
      </footer>

    </div>
  );
}

import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ style = {} }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        background: 'none',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        padding: '6px 10px',
        color: 'var(--color-text-muted)',
        fontSize: '1rem',
        lineHeight: 1,
        transition: 'var(--transition)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      onMouseOver={e => e.currentTarget.style.color = 'var(--color-text)'}
      onMouseOut={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

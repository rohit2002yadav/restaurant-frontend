export default function Button({ children, variant = 'primary', loading, className = '', type = 'button', ...props }) {
  const cls = variant === 'danger' ? 'btn btn-danger' : variant === 'ghost' ? 'btn btn-ghost' : 'btn btn-primary';
  return (
    <button type={type} className={`${cls} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <><span className="btn-spinner" />Loading...</> : children}
    </button>
  );
}

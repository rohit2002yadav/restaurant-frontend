export default function Input({ label, error, icon: Icon, rightElement, ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="input-wrap">
        {Icon && <Icon className="input-icon" />}
        <input
          className={`input-field${Icon ? ' has-icon' : ''}${rightElement ? ' has-right' : ''}${error ? ' error' : ''}`}
          {...props}
        />
        {rightElement}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

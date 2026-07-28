export default function ProgressBar({ value, max, label }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="progress-bar" aria-label={label || "progress"}>
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
        <span className="progress-bar__marker" style={{ left: `${pct}%` }}>🍎</span>
      </div>
      {label && <div className="progress-bar__label">{label}</div>}
    </div>
  );
}

export default function StatBar({ label, value, max = 160 }) {
  const percent = Math.min(100, (value / max) * 100);
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <div className="stat-track"><div className="stat-fill" style={{ width: `${percent}%` }} /></div>
      <strong>{value}</strong>
    </div>
  );
}

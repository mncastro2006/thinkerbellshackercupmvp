export default function IconCircle({ size = 96, emoji = "🔔" }) {
  return (
    <div className="icon-circle" style={{ width: size, height: size, fontSize: size * 0.45 }}>
      {emoji}
    </div>
  );
}

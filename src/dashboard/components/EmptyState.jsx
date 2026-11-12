export default function EmptyState({ title, sub, children }) {
  return (
    <div className="empty">
      <div className="serif">{title}</div>
      {sub}
      {children && <div style={{ marginTop: 14 }}>{children}</div>}
    </div>
  );
}

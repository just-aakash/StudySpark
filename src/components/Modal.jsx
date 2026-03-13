export default function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: wide ? 800 : 640 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        {title && (
          <h2 style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 20, marginBottom: 20, color: "var(--accent)" }}>{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
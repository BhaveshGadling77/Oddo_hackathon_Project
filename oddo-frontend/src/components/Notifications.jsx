export default function NotificationsPanel({ onClose }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <div className="modal-title">🔔 Notifications</div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="text-muted text-sm">No new notifications.</div>
      </div>
    </div>
  )
}

import { useAuthStore } from '../../store/authStore';

export default function Header({ title, onToggleSidebar }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const initial = (user?.username || user?.email || '?').charAt(0).toUpperCase();

  return (
    <header className="header">
      <div className="row">
        <button className="hamburger" onClick={onToggleSidebar} aria-label="Toggle menu">
          ☰
        </button>
        <span className="title">{title}</span>
      </div>
      <div className="row" style={{ gap: 14 }}>
        <span className="text-muted" style={{ fontSize: 13 }}>
          {user?.username || user?.email}
        </span>
        <div className="avatar" title={user?.email}>
          {initial}
        </div>
        <button className="btn btn-sm" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}

import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  onMenuClick: () => void;
}

function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button
          className="menu-button"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">+</div>

          <div className="navbar-brand-text">
            <h2>HMS</h2>
            <span>Hospital Management System</span>
          </div>
        </Link>
      </div>

      <div className="navbar-right">
        {user && (
          <Link to="/profile" className="navbar-user">
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <strong>{user.username}</strong>

              <span className={`role-badge role-${user.role}`}>
                {user.role}
              </span>
            </div>
          </Link>
        )}

        <div className="navbar-divider" />

        <button
          className="logout-button"
          onClick={logout}
          title="Logout"
        >
          <span className="logout-icon">↪</span>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
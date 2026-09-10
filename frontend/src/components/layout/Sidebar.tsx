import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
}

function Sidebar({ isOpen }: SidebarProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <aside className={isOpen ? "sidebar" : "sidebar collapsed"}>
      <div className="sidebar-section">
        <p className="sidebar-title">MAIN MENU</p>

        <NavLink
          to={`/${user.role}/dashboard`}
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <span className="sidebar-icon">▣</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/appointments"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <span className="sidebar-icon">◷</span>
          <span>Appointments</span>
        </NavLink>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-title">MEDICAL</p>

        {(user.role === "admin" ||
          user.role === "doctor" ||
          user.role === "patient") && (
          <>
            <NavLink
              to="/medical-records"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-icon">▤</span>
              <span>Medical Records</span>
            </NavLink>

            <NavLink
              to="/prescriptions"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-icon">✚</span>
              <span>Prescriptions</span>
            </NavLink>
          </>
        )}

        <NavLink
          to="/departments"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <span className="sidebar-icon">⊞</span>
          <span>Departments</span>
        </NavLink>

        <NavLink
          to="/doctors"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <span className="sidebar-icon">♙</span>
          <span>Doctors</span>
        </NavLink>

        {(user.role === "admin" || user.role === "staff") && (
          <NavLink
            to="/patients"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <span className="sidebar-icon">♙</span>
            <span>Patients</span>
          </NavLink>
        )}
      </div>

      {(user.role === "admin" || user.role === "staff") && (
        <div className="sidebar-section">
          <p className="sidebar-title">ADMINISTRATION</p>

          {user.role === "admin" && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <span className="sidebar-icon">◉</span>
              <span>Users</span>
            </NavLink>
          )}

          <NavLink
            to="/billing"
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <span className="sidebar-icon">$</span>
            <span>Billing</span>
          </NavLink>
        </div>
      )}

      <div className="sidebar-bottom">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          <span className="sidebar-icon">⚙</span>
          <span>Profile</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
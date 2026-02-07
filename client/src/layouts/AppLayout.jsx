import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <aside style={{ width: "220px", padding: "1rem", borderRight: "1px solid #eee" }}>
        <h3>Health Hive</h3>

        <nav>
          <p onClick={() => navigate("/discussions")}>Discussions</p>

          {user && (
            <p onClick={() => navigate("/new-discussion")}>
              New Discussion
            </p>
          )}

          {user?.role === "doctor" && user.isDoctorVerified && (
            <p onClick={() => navigate("/diagnosis")}>
              Diagnosis
            </p>
          )}

          {user?.role === "admin" && (
            <p onClick={() => navigate("/admin")}>
              Admin
            </p>
          )}
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "1.5rem" }}>
        <header style={{ display: "flex", justifyContent: "space-between" }}>
          <span>
            {user ? `Welcome, ${user.name}` : "Welcome"}
          </span>

          {user && (
            <button onClick={handleLogout}>
              Logout
            </button>
          )}
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;

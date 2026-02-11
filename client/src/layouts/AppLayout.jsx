import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const topics = [
    "All Topics",
    "General Health",
    "Mental Health",
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Dermatology",
    "Nutrition",
    "Fitness",
    "Women's Health",
    "Men's Health"
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">

      {/* ================= TOP NAV ================= */}
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">

        <div className="flex items-center gap-8">
          <h1
            onClick={() => navigate("/discussions")}
            className="text-xl font-semibold cursor-pointer"
          >
            Health Hive
          </h1>

          <NavLink
            to="/discussions"
            className="text-slate-600 hover:text-slate-900 text-sm"
          >
            Forum
          </NavLink>
        </div>

        <div className="flex items-center gap-4 text-sm">

          {!user && (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-slate-600 hover:text-slate-900"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/signup")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Sign Up
              </button>
            </>
          )}

          {user && (
            <>
              <span className="text-slate-700 font-medium">
                {user.name}
              </span>

              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="text-red-500"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      {/* ================= BODY ================= */}
      <div className="flex flex-1">

        {/* LEFT SIDEBAR */}
        <aside className="w-64 bg-white border-r p-6 hidden md:block">

          <p className="text-xs text-slate-400 uppercase mb-4">
            Topics
          </p>

          <div className="space-y-3">
            {topics.map((topic, index) => (
              <button
                key={index}
                className="block w-full text-left text-sm text-slate-600 hover:text-slate-900"
              >
                {topic}
              </button>
            ))}
          </div>

        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

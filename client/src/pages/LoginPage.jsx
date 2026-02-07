import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage({ setUser }) {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const login = () => {
    // TEMP login (JWT later)
    setUser({
      name: "Test User",
      role: "patient",
    });
    navigate("/discussions");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Health Hive
        </h1>

        <input
          className="w-full p-3 border rounded mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 border rounded mb-4"
          placeholder="Password"
        />

        <button
          onClick={login}
          className="w-full bg-emerald-600 text-white py-3 rounded hover:bg-emerald-700"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}

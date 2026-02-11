import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../Context/AuthContext";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/signup", form);

      // Auto-login after signup
      login(res.data);

      navigate("/discussions");
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded w-96 shadow">
        <h1 className="text-xl font-bold mb-4">
          Create Account
        </h1>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">
            {error}
          </div>
        )}

        <input
          className="border p-2 w-full mb-2"
          placeholder="Full name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          className="border p-2 w-full mb-2"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <select
          className="border p-2 w-full mb-4"
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="user">Regular User</option>
          <option value="doctor">Doctor</option>
        </select>

        <button
          onClick={submit}
          disabled={loading}
          className="bg-emerald-600 text-white w-full p-2 rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Sign up"}
        </button>

        <p
          onClick={() => navigate("/login")}
          className="text-sm text-blue-600 mt-3 text-center cursor-pointer"
        >
          Already have an account? Sign in
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";

export default function LoginPage({ onLogin, goToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("regular");

  const submit = async () => {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, userType })
    });

    const data = await res.json();

    if (res.ok) {
      onLogin(data.user);
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded w-96 shadow">
        <h1 className="text-xl font-bold mb-4">Health Hive</h1>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <select
          className="border p-2 w-full mb-4"
          value={userType}
          onChange={e => setUserType(e.target.value)}
        >
          <option value="regular">Regular User</option>
          <option value="doctor">Doctor</option>
        </select>

        <button
          onClick={submit}
          className="bg-black text-white w-full p-2"
        >
          Sign in
        </button>

        <p
          onClick={goToSignup}
          className="text-sm text-blue-600 text-center mt-3 cursor-pointer"
        >
          No account? Sign up
        </p>
      </div>
    </div>
  );
}

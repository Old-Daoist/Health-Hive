import { useState } from "react";

export default function SignupPage({ goToLogin }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    userType: "regular"
  });

  const submit = async () => {
    const res = await fetch("http://localhost:5000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (res.ok) {
      alert("Account created. Please sign in.");
      goToLogin();
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded w-96 shadow">
        <h1 className="text-xl font-bold mb-4">Create Account</h1>

        <input
          className="border p-2 w-full mb-2"
          placeholder="First name"
          onChange={e => setForm({ ...form, firstName: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Last name"
          onChange={e => setForm({ ...form, lastName: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-2"
          type="password"
          placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <select
          className="border p-2 w-full mb-4"
          onChange={e => setForm({ ...form, userType: e.target.value })}
        >
          <option value="regular">Regular User</option>
          <option value="doctor">Doctor</option>
        </select>

        <button
          onClick={submit}
          className="bg-black text-white w-full p-2"
        >
          Sign up
        </button>

        <p
          onClick={goToLogin}
          className="text-sm text-blue-600 mt-3 text-center cursor-pointer"
        >
          Already have an account? Sign in
        </p>
      </div>
    </div>
  );
}

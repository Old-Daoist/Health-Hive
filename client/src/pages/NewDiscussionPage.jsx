import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function NewDiscussionPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    symptoms: "",
    duration: "",
    category: "General Health",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/discussions", form);

      // ✅ Redirect back to discussion list
      navigate("/discussions");

    } catch (error) {
      console.error("Failed to create discussion:", error);
      alert("Failed to create discussion");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl border shadow-sm">
      <h2 className="text-xl font-semibold mb-6">
        Create New Discussion
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          className="w-full border rounded-lg px-4 py-2"
          required
        />

        <textarea
          placeholder="Describe your symptoms..."
          value={form.symptoms}
          onChange={(e) =>
            setForm({ ...form, symptoms: e.target.value })
          }
          className="w-full border rounded-lg px-4 py-2"
          rows={4}
          required
        />

        <input
          type="text"
          placeholder="Duration"
          value={form.duration}
          onChange={(e) =>
            setForm({ ...form, duration: e.target.value })
          }
          className="w-full border rounded-lg px-4 py-2"
          required
        />

        <select
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value })
          }
          className="w-full border rounded-lg px-4 py-2"
        >
          <option>General Health</option>
          <option>Mental Health</option>
          <option>Cardiology</option>
          <option>Neurology</option>
          <option>Pediatrics</option>
          <option>Dermatology</option>
          <option>Nutrition</option>
          <option>Fitness</option>
          <option>Women's Health</option>
          <option>Men's Health</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Post Discussion
        </button>

      </form>
    </div>
  );
}

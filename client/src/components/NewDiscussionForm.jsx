import { useState } from "react";

export default function NewDiscussionForm({ user, onCreated }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState("General");

  const submit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/discussions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        tag,
        authorName: user.name,
        authorType: user.type
      })
    });

    if (res.ok) {
      setTitle("");
      setBody("");
      onCreated();
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white p-4 rounded-lg shadow mb-6 space-y-3"
    >
      <h3 className="font-semibold text-lg">Start a Discussion</h3>

      <input
        className="w-full p-2 border rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="w-full p-2 border rounded"
        placeholder="Write your question..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />

      <select
        className="w-full p-2 border rounded"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
      >
        <option>General</option>
        <option>Cardiology</option>
        <option>Diabetes</option>
        <option>Mental Health</option>
      </select>

      <button className="bg-gray-900 text-white px-4 py-2 rounded">
        Post
      </button>
    </form>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../Context/AuthContext";

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isCreateMode = !id;

  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  <button
  onClick={() => navigate(-1)}
  className="mb-4 text-sm text-blue-600 hover:underline"
>
  ← Back
</button>


  const [form, setForm] = useState({
    title: "",
    symptoms: "",
    duration: "",
    age: "",
    gender: "",
    region: "",
    category: "general"
  });

  const [replyText, setReplyText] = useState("");

  /* ===========================
     FETCH DISCUSSION
  =========================== */
  useEffect(() => {
    if (!isCreateMode) {
      fetchDiscussion();
    }
  }, [id]);

  const fetchDiscussion = async () => {
    try {
      const res = await API.get(`/discussions/${id}`);
      setDiscussion(res.data.discussion);
      setReplies(res.data.replies);
    } catch (error) {
      console.error("Failed to load discussion");
    }
  };

  /* ===========================
     CREATE DISCUSSION
  =========================== */
  const handleCreate = async () => {
    try {
      const res = await API.post("/discussions", {
        ...form,
        symptoms: form.symptoms
      });

      navigate(`/discussions/${res.data.discussion._id}`);
    } catch (error) {
      alert("Failed to create discussion");
    }
  };

  /* ===========================
     SUBMIT REPLY
  =========================== */
  const handleReply = async () => {
    if (!replyText.trim()) return;

    try {
      await API.post(`/replies/${id}`, {
        content: replyText
      });

      setReplyText("");
      fetchDiscussion();
    } catch {
      alert("Failed to submit reply");
    }
  };

  /* ===========================
     CREATE MODE UI
  =========================== */
  if (isCreateMode) {
    return (
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
        <h2 className="text-2xl font-semibold mb-6">
          Create New Discussion
        </h2>

        <div className="space-y-4">

          <input
            placeholder="Title"
            className="w-full border rounded-lg px-4 py-2"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />

          <textarea
            placeholder="Symptoms (comma separated)"
            className="w-full border rounded-lg px-4 py-2"
            rows={4}
            value={form.symptoms}
            onChange={(e) =>
              setForm({ ...form, symptoms: e.target.value })
            }
          />

          <input
            placeholder="Duration"
            className="w-full border rounded-lg px-4 py-2"
            value={form.duration}
            onChange={(e) =>
              setForm({ ...form, duration: e.target.value })
            }
          />

          <input
            placeholder="Age (optional)"
            className="w-full border rounded-lg px-4 py-2"
            value={form.age}
            onChange={(e) =>
              setForm({ ...form, age: e.target.value })
            }
          />

          <select
            className="w-full border rounded-lg px-4 py-2"
            value={form.gender}
            onChange={(e) =>
              setForm({ ...form, gender: e.target.value })
            }
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <input
            placeholder="Region"
            className="w-full border rounded-lg px-4 py-2"
            value={form.region}
            onChange={(e) =>
              setForm({ ...form, region: e.target.value })
            }
          />

          <select
            className="w-full border rounded-lg px-4 py-2"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          >
            <option value="general">General</option>
            <option value="cardiology">Cardiology</option>
            <option value="endocrinology">Endocrinology</option>
            <option value="psychiatry">Psychiatry</option>
            <option value="pediatrics">Pediatrics</option>
            <option value="orthopedics">Orthopedics</option>
            <option value="other">Other</option>
          </select>

          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Post Discussion
          </button>

        </div>
      </div>
    );
  }

  /* ===========================
     VIEW MODE UI
  =========================== */

  if (!discussion) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto">

      <div className="bg-white p-8 rounded-xl shadow-sm border mb-8">

        <h2 className="text-2xl font-semibold mb-2">
          {discussion.title}
        </h2>

        <p className="text-sm text-slate-500 mb-4">
          {discussion.author?.name}
        </p>

        <p className="text-slate-700 mb-4">
          {Array.isArray(discussion.symptoms)
            ? discussion.symptoms.join(", ")
            : discussion.symptoms}
        </p>

        <div className="text-sm text-slate-500 flex gap-6">
          <span>👁 {discussion.views || 0} views</span>
          <span>👍 {discussion.likes || 0} likes</span>
        </div>

      </div>

      {/* Replies */}
      <div className="space-y-4">
        {replies.map((reply) => (
          <div
            key={reply._id}
            className="bg-white border rounded-lg p-4"
          >
            <p className="text-sm text-slate-500 mb-2">
              {reply.doctor?.name}
            </p>

            <p>{reply.content}</p>
          </div>
        ))}
      </div>

      {/* Doctor Reply */}
      {user?.role === "doctor" && user?.isDoctorVerified && (
        <div className="mt-8 bg-white p-6 rounded-xl border">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write diagnosis..."
            className="w-full border rounded-lg px-4 py-2"
            rows={4}
          />

          <button
            onClick={handleReply}
            className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg"
          >
            Submit Diagnosis
          </button>
        </div>
      )}

    </div>
  );
}

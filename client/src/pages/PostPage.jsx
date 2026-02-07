import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import API from "../services/api";

import { useAuth } from "../context/AuthContext";
import ReportButton from "../components/ReportButton";

const PostPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDiscussion = async () => {
    try {
      const res = await API.get(`/discussions/${id}`);
      setDiscussion(res.data.discussion);
      setReplies(res.data.replies);
    } catch (err) {
      console.error("Failed to load discussion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussion();
  }, [id]);

  const submitReply = async () => {
    if (!content.trim()) return;

    try {
      await API.post(`/replies/${id}`, { content });
      setContent("");
      fetchDiscussion();
    } catch {
      alert("Failed to submit reply");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!discussion) return <p>Discussion not found</p>;

  return (
    <div>

      {/* ================= DISCUSSION ================= */}
      <h2>{discussion.title}</h2>

      <p>
        <strong>{discussion.author.name}</strong>
        {discussion.author.role === "doctor" &&
          discussion.author.isDoctorVerified &&
          " ✔ Verified Doctor"}
      </p>

      <p>{discussion.symptoms}</p>

      {user && (
        <ReportButton
          targetType="discussion"
          targetId={discussion._id}
        />
      )}

      <hr />

      {/* ================= REPLIES ================= */}
      <h3>Doctor Responses</h3>

      {replies.length === 0 && <p>No responses yet.</p>}

      {replies.map((r) => (
        <div
          key={r._id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1rem"
          }}
        >
          <p>
            <strong>{r.doctor.name}</strong>
            {r.doctor.isDoctorVerified && " ✔ Verified Doctor"}
          </p>

          <p>{r.content}</p>

          {user && (
            <ReportButton
              targetType="reply"
              targetId={r._id}
            />
          )}
        </div>
      ))}

      {/* ================= DOCTOR REPLY BOX ================= */}
      {user?.role === "doctor" && user.isDoctorVerified && (
        <div style={{ marginTop: "2rem" }}>
          <h4>Write Diagnosis</h4>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write diagnosis..."
            rows={4}
            style={{ width: "100%" }}
          />

          <button onClick={submitReply} style={{ marginTop: "0.5rem" }}>
            Submit Reply
          </button>
        </div>
      )}
    </div>
  );
};

export default PostPage;

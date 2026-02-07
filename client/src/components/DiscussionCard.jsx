import { useState } from "react";

export default function DiscussionCard({ discussion, user, refresh }) {
  const [comment, setComment] = useState("");

  const like = async () => {
    await fetch(
      `http://localhost:5000/api/discussions/${discussion._id}/like`,
      { method: "POST" }
    );
    refresh();
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await fetch(
      `http://localhost:5000/api/discussions/${discussion._id}/comment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: user.name,
          authorType: user.type,
          body: comment
        })
      }
    );

    setComment("");
    refresh();
  };

  return (
    <div className="bg-white p-4 rounded shadow space-y-3">
      <h3 className="font-semibold text-lg">{discussion.title}</h3>
      <p>{discussion.body}</p>

      <div className="text-sm text-gray-500">
        {discussion.authorName} • {discussion.tag}
        {discussion.authorType === "doctor" && (
          <span className="ml-2 text-green-600 font-semibold">Doctor</span>
        )}
      </div>

      <button
        onClick={like}
        className="text-sm text-blue-600 font-semibold"
      >
        👍 {discussion.likes}
      </button>

      {/* Comments */}
      <div className="space-y-2">
        {discussion.comments.map((c, i) => (
          <div key={i} className="bg-gray-100 p-2 rounded text-sm">
            <strong>{c.authorName}</strong>: {c.body}
          </div>
        ))}
      </div>

      <form onSubmit={addComment} className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button className="bg-gray-900 text-white px-3 rounded">
          Send
        </button>
      </form>
    </div>
  );
}

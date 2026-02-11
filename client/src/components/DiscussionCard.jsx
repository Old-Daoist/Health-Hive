import { useNavigate } from "react-router-dom";

export default function DiscussionCard({ discussion }) {
  const navigate = useNavigate();

  const authorName =
    discussion.author?.name || "Unknown User";

  return (
    <div
      onClick={() => navigate(`/discussions/${discussion._id}`)}
      className="bg-white rounded-xl border p-6 shadow-sm cursor-pointer hover:shadow-md transition"
    >
      <h3 className="text-lg font-semibold mb-1">
        {discussion.title}
      </h3>

      <p className="text-sm text-slate-500 mb-3">
        {authorName}
      </p>

      <div className="text-sm text-slate-500 flex gap-4">
        <span>👁 {discussion.views || 0} views</span>
        <span>👍 {discussion.likes || 0} likes</span>
      </div>
    </div>
  );
}

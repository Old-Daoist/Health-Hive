import { useEffect, useState } from "react";
import NewDiscussionForm from "../components/NewDiscussionForm";
import DiscussionList from "../components/DiscussionList";

export default function UserDashboard({ user, logout }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/discussions");
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <button onClick={logout} className="text-red-600 font-medium">
          Logout
        </button>
      </div>

      {/* Create Discussion */}
      <NewDiscussionForm user={user} onPost={load} />

      {/* Divider */}
      <hr className="my-6" />

      {/* Discussions Section */}
      <h2 className="text-xl font-semibold mb-4">
        Community Discussions
      </h2>

      {loading && <p className="text-gray-500">Loading discussions...</p>}

      {!loading && posts.length === 0 && (
        <p className="text-gray-500">
          No discussions yet. Be the first to post!
        </p>
      )}

      {!loading && posts.length > 0 && (
        <DiscussionList posts={posts} user={user} reload={load} />
      )}
    </div>
  );
}

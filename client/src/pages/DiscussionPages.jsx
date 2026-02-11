import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import DiscussionCard from "../components/DiscussionCard";

export default function DiscussionPages() {
  const [discussions, setDiscussions] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const res = await API.get("/discussions");
        setDiscussions(res.data.discussions || []);
      } catch (error) {
        console.error("Failed to fetch discussions:", error);
        setDiscussions([]);
      }
    };

    fetchDiscussions();
  }, []);

  const filtered = discussions.filter((d) =>
    d.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">

      {/* HEADER CARD */}
      <div className="bg-white rounded-xl border p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              Recent Discussions
            </h2>
            <p className="text-sm text-slate-500">
              Join the conversation with doctors and patients
            </p>
          </div>

          {/* FIXED BUTTON */}
          <button
            onClick={() => navigate("/new-discussion")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            + New Discussion
          </button>
        </div>

        <div className="mt-6 flex gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keywords, symptoms, or tags..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button className="border rounded-lg px-4 py-2 text-sm">
            Sort: Newest
          </button>
        </div>
      </div>

      {/* DISCUSSIONS LIST */}
      <div className="space-y-6">
        {filtered.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No discussions found.
          </p>
        ) : (
          filtered.map((discussion) => (
            <DiscussionCard
              key={discussion._id}
              discussion={discussion}
            />
          ))
        )}
      </div>

    </div>
  );
}

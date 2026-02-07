import { Link } from "react-router-dom";

export default function DiscussionCard() {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <div className="flex justify-between">
        <h3 className="font-semibold text-lg">
          Understanding High Blood Pressure
        </h3>
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
          Cardiology
        </span>
      </div>

      <p className="text-slate-600 mt-2">
        Can someone explain what causes high blood pressure?
      </p>

      <div className="text-sm text-slate-500 mt-3">
        John Smith • 2024-01-15
      </div>

      <Link
        to="/post/1"
        className="text-emerald-600 text-sm mt-2 inline-block"
      >
        View discussion →
      </Link>
    </div>
  );
}

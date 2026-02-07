import { useEffect, useState } from "react";
import API from "../services/api";

const AdminModeration = () => {
  const [reports, setReports] = useState([]);

  const load = async () => {
    const res = await API.get("/moderation/reports");
    setReports(res.data);
  };

  useEffect(() => { load(); }, []);

  const resolve = async (id) => {
    await API.post(`/moderation/reports/${id}/resolve`);
    load();
  };

  const dismiss = async (id) => {
    await API.post(`/moderation/reports/${id}/dismiss`);
    load();
  };

  return (
    <div>
      <h2>Moderation Reports</h2>

      {reports.map(r => (
        <div key={r._id} style={{ border: "1px solid #ccc", margin: "1rem", padding: "1rem" }}>
          <p><strong>Reporter:</strong> {r.reporter.name}</p>
          <p><strong>Target:</strong> {r.targetType}</p>
          <p><strong>Reason:</strong> {r.reason}</p>
          <p><strong>Status:</strong> {r.status}</p>

          {r.status === "pending" && (
            <>
              <button onClick={() => resolve(r._id)}>Resolve</button>
              <button onClick={() => dismiss(r._id)}>Dismiss</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminModeration;

import { useEffect, useState } from "react";
import API from "../services/api";

const AdminVerification = () => {
  const [list, setList] = useState([]);

  const load = async () => {
    const res = await API.get("/admin/verifications");
    setList(res.data);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await API.post(`/admin/verify/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    await API.post(`/admin/verify/${id}/reject`);
    load();
  };

  return (
    <div>
      <h2>Doctor Verification Requests</h2>

      {list.map(v => (
        <div key={v._id} style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <p><strong>{v.user.name}</strong> ({v.user.email})</p>
          <p>{v.qualification}</p>
          <a href={`http://localhost:5000/${v.documentUrl}`} target="_blank">
            View Document
          </a>
          <br />
          <button onClick={() => approve(v._id)}>Approve</button>
          <button onClick={() => reject(v._id)}>Reject</button>
        </div>
      ))}
    </div>
  );
};

export default AdminVerification;

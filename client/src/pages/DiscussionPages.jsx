import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const DiscussionPages = () => {
  const [discussions, setDiscussions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/discussions").then(res => setDiscussions(res.data));
  }, []);

  return (
    <div>
      <h2>Discussions</h2>

      {discussions.map(d => (
        <div
          key={d._id}
          onClick={() => navigate(`/discussions/${d._id}`)}
          style={{ border: "1px solid #ddd", padding: "1rem", marginBottom: "1rem", cursor: "pointer" }}
        >
          <h3>{d.title}</h3>

          <p>
            <strong>{d.author.name}</strong>
            {d.author.role === "doctor" && d.author.isDoctorVerified && " ✔ Verified Doctor"}
          </p>

          <p>{d.symptoms.slice(0, 120)}...</p>
        </div>
      ))}
    </div>
  );
};

export default DiscussionPages;

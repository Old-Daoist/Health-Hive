import { useState } from "react";
import API from "../services/api";

const DoctorVerification = () => {
  const [form, setForm] = useState({
    qualification: "",
    registrationNumber: "",
    country: ""
  });
  const [file, setFile] = useState(null);

  const submit = async () => {
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append("document", file);

    await API.post("/doctor/verify", data);
    alert("Submitted for review");
  };

  return (
    <div>
      <h2>Doctor Verification</h2>

      <input placeholder="Qualification"
        onChange={e => setForm({ ...form, qualification: e.target.value })} />

      <input placeholder="Registration Number"
        onChange={e => setForm({ ...form, registrationNumber: e.target.value })} />

      <input placeholder="Country"
        onChange={e => setForm({ ...form, country: e.target.value })} />

      <input type="file" onChange={e => setFile(e.target.files[0])} />

      <button onClick={submit}>Submit</button>
    </div>
  );
};

export default DoctorVerification;

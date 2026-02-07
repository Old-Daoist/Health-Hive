import API from "../services/api";

const ReportButton = ({ targetType, targetId }) => {
  const submit = async () => {
    const reason = prompt("Why are you reporting this?");
    if (!reason) return;

    await API.post("/reports", {
      targetType,
      targetId,
      reason
    });

    alert("Reported. Admin will review.");
  };

  return (
    <button onClick={submit} style={{ color: "red" }}>
      Report
    </button>
  );
};

export default ReportButton;

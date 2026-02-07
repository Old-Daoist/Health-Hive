import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignUpPage";
import UserDashboard from "./pages/UserDashBoard";
import DoctorDashboard from "./pages/DoctorDashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("login"); // login | signup

  if (!user) {
    if (view === "signup") {
      return <SignupPage goToLogin={() => setView("login")} />;
    }

    return (
      <LoginPage
        onLogin={setUser}
        goToSignup={() => setView("signup")}
      />
    );
  }

  if (user.type === "doctor") {
    return <DoctorDashboard user={user} logout={() => setUser(null)} />;
  }

  return <UserDashboard user={user} logout={() => setUser(null)} />;
}

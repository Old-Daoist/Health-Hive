import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import DiscussionPages from "./pages/DiscussionPages";
import PostPage from "./pages/PostPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DoctorVerification from "./pages/DoctorVerification";
import AdminVerification from "./pages/AdminVerification";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<AppLayout />}>
          <Route path="/" element={<DiscussionPages />} />
          <Route path="/discussions" element={<DiscussionPages />} />
          <Route path="/discussions/:id" element={<PostPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        <Route element={<ProtectedRoute roles={["user", "doctor", "admin"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/new-discussion" element={<PostPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["doctor"]} requireVerifiedDoctor />}>
          <Route element={<AppLayout />}>
            <Route path="/diagnosis" element={<PostPage />} />
            <Route path="/verify-doctor" element={<DoctorVerification />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin" element={<AdminVerification />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

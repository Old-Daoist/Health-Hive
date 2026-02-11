import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import DiscussionPages from "./pages/DiscussionPages";
import PostPage from "./pages/PostPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<DiscussionPages />} />
          <Route path="/discussions" element={<DiscussionPages />} />
          <Route path="/discussions/:id" element={<PostPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected Create Route */}
        <Route element={<ProtectedRoute roles={["user", "doctor", "admin"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/new-discussion" element={<PostPage />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

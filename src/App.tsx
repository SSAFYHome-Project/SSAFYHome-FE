import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import InfoPage from "./pages/InfoPage";
import OAuthCallback from "./components/auth/OAuthCallback";
import CommunityPage from "./pages/CommunityPage";
import CommunityWritePage from "./pages/CommunityWritePage";
import CommunityDetailPage from "./pages/CommunityDetailPage";
import CommmunityEditPage from "./pages/CommunityEditPage";
import ForgotPasswordForm from "./pages/ForgotPasswordPage";
import ResetPasswordForm from "./pages/ResetPasswordPage";
import AdminUserPage from "./pages/AdminUserPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/oauth/success" element={<OAuthCallback />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community-write" element={<CommunityWritePage />} />
        <Route path="/community-detail" element={<CommunityDetailPage />} />
        <Route path="/community-edit/:id" element={<CommmunityEditPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordForm />} />
        <Route path="/reset-password" element={<ResetPasswordForm />} />
        <Route path="/admin/users" element={<AdminUserPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

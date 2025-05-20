import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import InfoPage from "./pages/InfoPage";
import OAuthCallback from "./components/auth/OAuthCallback";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/oauth/success" element={<OAuthCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

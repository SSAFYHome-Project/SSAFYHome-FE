// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/loginPage";
// import AiSummaryPage from './pages/AiSummaryPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/ai-summary" element={<AiSummaryPage />} />  */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

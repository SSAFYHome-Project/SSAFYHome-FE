import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/LoginForm.css";
import googleLogo from "../../assets/img/google_logo.png";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const getActiveClass = (path: string) => (location.pathname === path ? "active" : "");

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("유효한 이메일 주소를 입력해 주세요.");
      return;
    }

    if (!email || !password) {
      setErrorMessage("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      const data = await response.json();
      const token = data.token;
      if (token) {
        localStorage.setItem("accessToken", token);
      }
      setErrorMessage("");
      navigate("/");
    } catch (error) {
      console.error("로그인 오류:", error);
      setErrorMessage("서버 오류가 발생했습니다.");
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="auth-box">
      <button className="google-login">
        <img src={googleLogo} alt="Google Logo" className="google-logo" />
        Google 계정으로 로그인
      </button>

      <input type="text" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />

      <div className="auth-actions">
        <button className={`login-btn ${getActiveClass("/")}`} onClick={handleLogin}>
          로그인
        </button>
        <button className={`register-btn ${getActiveClass("/register")}`} onClick={handleRegister}>
          회원가입
        </button>
      </div>

      {errorMessage && (
        <div className="error-message">
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default LoginForm;

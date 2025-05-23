import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/LoginForm.css";
import googleLogo from "../../assets/img/google_logo.png";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saveEmail, setSaveEmail] = useState(() => {
    return localStorage.getItem("savedEmail") || "";
  });

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
      const response = await axios.post(
        "/api/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const token = response.data.token;
      const refreshToken = response.data.refreshToken;
      if (token) {
        localStorage.setItem("accessToken", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userEmail", email);
        setErrorMessage("");
        navigate("/");
      }
    } catch (error: any) {
      console.error("로그인 오류:", error);
      if (error.response?.status === 401) {
        setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setErrorMessage("서버 오류가 발생했습니다.");
      }
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  useEffect(() => {
    if (saveEmail) setEmail(saveEmail);
  }, []);

  return (
    <div className="auth-box">
      <button className="google-login" onClick={handleGoogleLogin}>
        <img src={googleLogo} alt="Google Logo" className="google-logo" />
        Google 계정으로 로그인
      </button>
      <input type="text" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
      <div className="options-row">
        <label className="checkbox-wrap">
          <input
            type="checkbox"
            checked={!!saveEmail}
            onChange={() => {
              if (saveEmail) {
                localStorage.removeItem("savedEmail");
                setSaveEmail("");
              } else {
                localStorage.setItem("savedEmail", email);
                setSaveEmail(email);
              }
            }}
          />
          <span className="checkmark"></span>
          이메일 저장
        </label>

        <span className="forgot-password" onClick={() => alert("비밀번호 찾기 기능은 준비 중입니다.")}>
          비밀번호 찾기
        </span>
      </div>
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

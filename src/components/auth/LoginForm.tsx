import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../../styles/LoginForm.css";
import googleLogo from "../../assets/img/google_logo.png";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saveEmail, setSaveEmail] = useState(() => {
    return localStorage.getItem("savedEmail") || "";
  });
  const [showPassword, setShowPassword] = useState(false);
  const isLoginEnabled = email && password;

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

      const { accessToken, refreshToken, passwordResetRequired } = response.data;

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setErrorMessage("");

        if (passwordResetRequired) {
          alert("현재는 임시 비밀번호로 로그인된 상태입니다. \n비밀번호를 수정해주세요.");
          navigate("/reset-password");
        } else {
          navigate("/");
        }
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
      <div className="divider">
        <span>또는 일반 로그인</span>
      </div>
      <input type="text" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span
          className="toggle-password"
          onClick={() => setShowPassword((prev) => !prev)}
          title={showPassword ? "숨기기" : "보기"}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>
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

        <span className="forgot-password" onClick={() => navigate("/forgot-password")}>
          비밀번호 찾기
        </span>
      </div>
      <div className="auth-actions">
        <button
          className={`login-btn ${getActiveClass("/")} ${isLoginEnabled ? "active" : ""}`}
          onClick={handleLogin}
          disabled={!isLoginEnabled}
        >
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

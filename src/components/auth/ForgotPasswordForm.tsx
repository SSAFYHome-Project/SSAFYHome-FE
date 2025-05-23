import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/LoginForm.css";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setMessage("");
    setError("");
    setLoading(true);

    if (!email) {
      setError("이메일을 입력해 주세요.");
      setLoading(false);
      return;
    }

    try {
      await axios.post("/api/user/reset-password", { email }, { headers: { "Content-Type": "application/json" } });

      setMessage("임시 비밀번호가 이메일로 전송되었습니다.");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data || "처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-box">
      {loading && <div className="progress-bar" />}

      <input
        type="email"
        placeholder="가입된 이메일 주소 입력"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <button className="register-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? "전송 중..." : "임시 비밀번호 받기"}
      </button>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="login-guide">
        <span onClick={() => navigate("/login")}>로그인으로 돌아가기</span>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;

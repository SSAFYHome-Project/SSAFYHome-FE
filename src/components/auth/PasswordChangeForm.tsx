import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/LoginForm.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordChangeForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isValidPassword = (pwd: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async () => {
    setMessage("");
    setError("");

    if (!isValidPassword(newPassword)) {
      setError("영문, 숫자, 특수문자 포함 8자 이상이어야 합니다.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("모든 항목을 입력해 주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("로그인이 필요합니다.");
        return;
      }

      await axios.post(
        "/api/user/change-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("비밀번호가 성공적으로 변경되었습니다.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data || "비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="auth-box-password">
      <div className="input-with-icon">
        <input
          type={showCurrentPassword ? "text" : "password"}
          placeholder="임시 비밀번호"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <span onClick={() => setShowCurrentPassword((prev) => !prev)}>
          {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      <div className="input-with-icon">
        <input
          type={showNewPassword ? "text" : "password"}
          placeholder="새 비밀번호"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <span onClick={() => setShowNewPassword((prev) => !prev)}>{showNewPassword ? <FaEyeSlash /> : <FaEye />}</span>
      </div>

      <div className="input-with-icon">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <span onClick={() => setShowConfirmPassword((prev) => !prev)}>
          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      <button className="register-btn" onClick={handleSubmit}>
        비밀번호 변경
      </button>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="password-guide">
        <span onClick={() => navigate("/login")}>로그인으로 돌아가기</span>
      </div>
    </div>
  );
};

export default PasswordChangeForm;

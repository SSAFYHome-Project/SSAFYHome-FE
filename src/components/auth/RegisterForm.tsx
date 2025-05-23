import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/RegisterForm.css";
import user from "../../assets/img/user.png";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [agree, setAgree] = useState(false);

  const navigate = useNavigate();

  const handleDuplicateCheck = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("유효한 이메일 주소를 입력해 주세요.");
      return;
    }
    if (!email) {
      setErrorMessage("이메일을 입력해 주세요.");
      return;
    }

    try {
      console.log("이메일 중복 확인 요청:", email);
      const response = await fetch(`/api/user/register/dup?email=${encodeURIComponent(email)}`);
      const result = await response.text();
      console.log("이메일 중복 확인 응답:", result);

      if (result === "false") {
        alert("사용 가능한 이메일입니다.");
        setErrorMessage("");
        setIsEmailChecked(true);
      } else {
        setErrorMessage("이미 사용 중인 이메일입니다.");
        setIsEmailChecked(false);
      }
    } catch (error) {
      console.error("이메일 중복 확인 오류:", error);
      setErrorMessage("이메일 확인 중 오류가 발생했습니다.");
      setIsEmailChecked(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !password || !confirmPassword || !email) {
      setErrorMessage("모든 항목을 입력해 주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!isEmailChecked) {
      setErrorMessage("이메일 중복 확인을 해주세요.");
      return;
    }

    const formData = new FormData();
    const userData = { name, email, password };

    formData.append("data", new Blob([JSON.stringify(userData)], { type: "application/json" }));

    try {
      if (profileImage) {
        formData.append("profileImage", profileImage);
      } else {
        const defaultImageResponse = await fetch(user);
        const defaultImageBlob = await defaultImageResponse.blob();
        formData.append("profileImage", defaultImageBlob, "default.png");
      }

      const response = await fetch("/api/user/register", {
        method: "POST",
        body: formData,
      });

      const result = await response.text();

      if (!response.ok) {
        setErrorMessage(result || "회원가입에 실패했습니다.");
        return;
      }

      navigate("/login");
    } catch (error) {
      console.error("회원가입 오류:", error);
      setErrorMessage("서버 오류가 발생했습니다.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="auth-box">
      <img src={previewUrl || user} alt="프로필" className="profile-preview" />

      <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />

      <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />

      <input
        type="password"
        placeholder="비밀번호 확인"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <div className="input-with-button">
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setIsEmailChecked(false);
          }}
        />
        <button onClick={handleDuplicateCheck} className="check-btn">
          중복 확인
        </button>
      </div>

      <input type="file" accept="image/*" onChange={handleImageChange} />

      <button className="signup-btn" onClick={handleRegister}>
        가입하기
      </button>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="login-guide">
        이미 계정이 있으신가요? <span onClick={() => navigate("/login")}>로그인 하기</span>
      </div>
    </div>
  );
};

export default RegisterForm;

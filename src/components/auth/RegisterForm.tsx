import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/RegisterForm.css";
import user from "../../assets/img/user.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("gmail.com");
  const email = `${emailId}@${emailDomain}`;
  const [agreed, setAgreed] = useState(false);
  const isValidPassword = (pwd: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(pwd);
  };

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
      const response = await fetch(`/api/user/register/dup?email=${encodeURIComponent(email)}`);
      const result = await response.text();

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

    if (!isValidPassword(password)) {
      setErrorMessage("영문, 숫자, 특수문자 포함 8자 이상이어야 합니다.");
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

    if (!agreed) {
      setErrorMessage("개인정보 수집 및 이용에 동의해 주세요.");
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

      <div className="input-with-icon">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
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

      <div className="email-input-group">
        <input
          type="text"
          placeholder="이메일 아이디"
          value={emailId}
          onChange={(e) => {
            setEmailId(e.target.value);
            setIsEmailChecked(false);
          }}
        />
        <select
          value={emailDomain}
          onChange={(e) => {
            setEmailDomain(e.target.value);
            setIsEmailChecked(false);
          }}
        >
          <option value="gmail.com">@gmail.com</option>
          <option value="naver.com">@naver.com</option>
          <option value="daum.net">@daum.net</option>
          <option value="hanmail.net">@hanmail.net</option>
          <option value="kakao.com">@kakao.com</option>
          <option value="hotmail.com">@hotmail.com</option>
          <option value="outlook.com">@outlook.com</option>
        </select>
        <button onClick={handleDuplicateCheck} className="check-btn">
          확인
        </button>
      </div>

      <input type="file" accept="image/*" onChange={handleImageChange} />

      <label className="checkbox-wrap">
        개인정보 수집 및 이용에 동의합니다.
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span className="checkmark"></span>
      </label>

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

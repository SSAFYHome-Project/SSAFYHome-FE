import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/RegisterForm.css";
import user from "../../assets/img/user.png";
import useDaumPostcode from "../../hooks/useDaumPostcode";

interface InfoFormProps {
  isAdmin?: boolean;
}

const InfoForm = ({ isAdmin = false }: InfoFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [workAddress, setWorkAddress] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const openPostcode = useDaumPostcode();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("accessToken"); // 로그인 시 저장한 JWT

        if (!token) {
          setErrorMessage("로그인이 필요합니다.");
          return;
        }

        const response = await fetch("/api/user/info", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ 여기서 JWT 넘겨줌
          },
        });

        if (!response.ok) {
          throw new Error("인증 실패 또는 서버 오류");
        }

        const data = await response.json();

        // 가져온 사용자 정보 저장
        setName(data.name || "");
        setEmail(data.email || "");
        setWorkAddress(data.workAddress || "");
        setSchoolAddress(data.schoolAddress || "");
        if (data.profile) {
          setPreviewUrl(`data:image/jpeg;base64,${data.profile}`);
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
        setErrorMessage("사용자 정보를 불러오지 못했습니다.");
      }
    };

    fetchUserInfo();
  }, []);

  const handleUpdate = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("모든 항목을 입력해 주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    const formData = new FormData();
    const userData: any = { name, email, password };

    if (!isAdmin) {
      userData.workAddress = workAddress;
      userData.schoolAddress = schoolAddress;
    }

    const jsonBlob = new Blob([JSON.stringify(userData)], { type: "application/json" });
    formData.append("data", jsonBlob);
    if (profileImage) formData.append("profileImage", profileImage);

    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        body: formData,
      });

      const result = await res.text();
      if (!res.ok) {
        setErrorMessage(result || "정보 수정 실패");
        return;
      }

      alert("수정 완료!");
      navigate("/");
    } catch (err) {
      console.error("업데이트 오류:", err);
      setErrorMessage("서버 오류가 발생했습니다.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("정말로 계정을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/user/info", {
        method: "DELETE",
      });

      const result = await res.text();
      if (!res.ok) {
        setErrorMessage(result || "계정 삭제 실패");
        return;
      }

      alert("계정이 삭제되었습니다.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    } catch (err) {
      console.error("계정 삭제 오류:", err);
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
      <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input
        type="password"
        placeholder="비밀번호 확인"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <input type="file" accept="image/*" onChange={handleImageChange} />

      {!isAdmin && (
        <>
          <div className="input-with-button">
            <input type="text" placeholder="직장 주소 입력" value={workAddress} readOnly />
            <button type="button" className="address-btn" onClick={() => openPostcode(setWorkAddress)}>
              주소 검색
            </button>
          </div>

          <div className="input-with-button">
            <input type="text" placeholder="학교 주소 입력" value={schoolAddress} readOnly />
            <button type="button" className="address-btn" onClick={() => openPostcode(setSchoolAddress)}>
              주소 검색
            </button>
          </div>
        </>
      )}

      <div className="btn-group">
        <button className="signup-btn" onClick={handleUpdate}>
          수정하기
        </button>
        <button className="delete-btn" onClick={handleDeleteAccount}>
          삭제하기
        </button>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default InfoForm;

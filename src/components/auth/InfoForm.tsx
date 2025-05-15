import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/RegisterForm.css";
import user from "../../assets/img/user.png";
import useDaumPostcode from "../../hooks/useDaumPostcode";
import axios from "axios";

interface InfoFormProps {
  isAdmin?: boolean;
}

interface Address {
  address: string;
  detailAddress: string;
  x: string;
  y: string;
}

const InfoForm = ({ isAdmin = false }: InfoFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [workAddress, setWorkAddress] = useState<Address>({
    address: "",
    detailAddress: "",
    x: "",
    y: "",
  });
  const [schoolAddress, setSchoolAddress] = useState<Address>({
    address: "",
    detailAddress: "",
    x: "",
    y: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [originalAddresses, setOriginalAddresses] = useState<any[]>([]);

  const navigate = useNavigate();
  const openPostcode = useDaumPostcode();

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setErrorMessage("로그인이 필요합니다.");
          return;
        }

        const response = await axios.get("/api/user/info", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;
        setName(data.name || "");
        setEmail(data.email || "");
        setOriginalAddresses(data.address || []);

        const school = data.address?.find((a: any) => a.title === "SCHOOL");
        const company = data.address?.find((a: any) => a.title === "COMPANY");

        setSchoolAddress({
          address: school?.address || "",
          detailAddress: school?.detailAddress || "",
          x: school?.x || "",
          y: school?.y || "",
        });

        setWorkAddress({
          address: company?.address || "",
          detailAddress: company?.detailAddress || "",
          x: company?.x || "",
          y: company?.y || "",
        });

        if (data.profile) {
          setPreviewUrl(`data:image/jpeg;base64,${data.profile}`);
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 실패:", error);
        setErrorMessage("사용자 정보를 불러오지 못했습니다.");
      }
    };

    getUserInfo();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    setErrorMessage("");
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErrorMessage("로그인이 필요합니다.");
      return;
    }

    if (!name) {
      setErrorMessage("이름은 필수 항목입니다.");
      return;
    }

    if ((password || confirmPassword) && password !== confirmPassword) {
      setErrorMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    const userData: any = {
      name,
      password: password || undefined,
    };

    const addresses: any[] = [];

    const originalSchool = originalAddresses.find((a: any) => a.title === "SCHOOL");
    const originalCompany = originalAddresses.find((a: any) => a.title === "COMPANY");

    if (originalCompany || workAddress.address) {
      addresses.push({
        title: "COMPANY",
        address: workAddress.address || "",
        detailAddress: workAddress.detailAddress || "",
        x: workAddress.x || "",
        y: workAddress.y || "",
      });
    }

    if (originalSchool || schoolAddress.address) {
      addresses.push({
        title: "SCHOOL",
        address: schoolAddress.address || "",
        detailAddress: schoolAddress.detailAddress || "",
        x: schoolAddress.x || "",
        y: schoolAddress.y || "",
      });
    }

    if (addresses.length > 0) {
      userData.addresses = addresses;
    }

    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(userData)], { type: "application/json" }));

    try {
      if (profileImage) {
        formData.append("profileImage", profileImage);
      } else {
        const defaultImgResponse = await fetch(user);
        const blob = await defaultImgResponse.blob();
        formData.append("profileImage", blob, "default.png");
      }

      await axios.patch("/api/user/info", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("수정이 완료되었습니다.");
      navigate("/");
    } catch (error: any) {
      console.error("업데이트 오류:", error);
      console.error(token);
      setErrorMessage(error.response?.data || "정보 수정 실패");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("정말로 계정을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("accessToken");

      await axios.delete("/api/user/info", {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("계정이 삭제되었습니다.");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      navigate("/");
    } catch (err: any) {
      console.error("계정 삭제 오류:", err);
      setErrorMessage(err.response?.data || "계정 삭제 실패");
    }
  };

  return (
    <div className="auth-box">
      <img src={previewUrl || user} alt="프로필" className="profile-preview" />

      <input type="text" placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="email" placeholder="이메일 (수정 불가)" value={email} readOnly />
      <input type="password" placeholder="새 비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
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
            <input type="text" placeholder="직장 주소 입력" value={workAddress.address} readOnly />
            <button type="button" className="address-btn" onClick={() => openPostcode(setWorkAddress)}>
              주소 검색
            </button>
          </div>

          <div className="input-with-button">
            <input type="text" placeholder="학교 주소 입력" value={schoolAddress.address} readOnly />
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

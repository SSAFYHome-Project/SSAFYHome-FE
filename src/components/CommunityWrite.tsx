import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import defaultProfile from "../assets/img/user.png";
import logoImg from "../assets/img/logo-feedback.png";
import "../styles/CommunityWrite.css";

export default function CommunityWrite() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userInfo, setUserInfo] = useState<{ name: string; profile: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    axios
      .get("/api/user/info", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setUserInfo(response.data))
      .catch((error) => {
        console.error("사용자 정보 조회 실패:", error);
        alert("사용자 정보를 불러오지 못했습니다.");
        navigate("/community");
      });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await axios.post(
        "/api/community/board",
        { title: title, content: content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/community");
    } catch (error) {
      console.error("글 작성 실패:", error);
      alert("글 작성에 실패했습니다.");
    }
  };

  return (
    <div className="community-write-container">
      <img src={logoImg} alt="지도밖은위험해 로고" className="community-logo" />

      {userInfo && (
        <div className="community-write-user">
          <img src={`data:image/png;base64,${userInfo.profile}`} alt="프로필" className="community-write-profile" />
          <span className="community-write-username">
            <strong>{userInfo.name}</strong> 님의 경험을 '지도 밖은 위험해' 커뮤니티에 나눠주세요 💛
          </span>
        </div>
      )}

      <form className="community-write-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="community-write-input"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          className="community-write-textarea"
          required
        />
        <button type="submit" className="community-write-submit">
          등록하기
        </button>
      </form>
    </div>
  );
}

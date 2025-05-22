import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import defaultProfile from "../assets/img/user.png";
import logoImg from "../assets/img/logo-feedback.png";
import "../styles/CommunityWrite.css";

export default function CommunityEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userInfo, setUserInfo] = useState<{ name: string; profile: string } | null>(null);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
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

    if (location.state?.post) {
      setTitle(location.state.post.boardTitle);
      setContent(location.state.post.boardContent);
    } else if (id) {
      axios
        .get(`/api/community/board/${id}`)
        .then((res) => {
          setTitle(res.data.boardTitle);
          setContent(res.data.boardContent);
        })
        .catch((err) => {
          console.error("글 정보 불러오기 실패:", err);
          alert("글 정보를 불러오는 데 실패했습니다.");
          navigate("/community");
        });
    }
  }, [navigate, id, location.state, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await axios.patch(
        `/api/community/board/${id}`,
        { title: title, content: content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("수정이 완료되었습니다.");
      navigate("/community-detail", { state: { id } });
    } catch (error) {
      console.error("수정 실패:", error);
      alert("글 수정에 실패했습니다.");
    }
  };

  return (
    <div className="community-write-container">
      <img src={logoImg} alt="지도밖은위험해 로고" className="community-logo" />

      {userInfo && (
        <div className="community-write-user">
          <img
            src={`data:image/png;base64,${userInfo.profile || defaultProfile}`}
            alt="프로필"
            className="community-write-profile"
          />
          <span className="community-write-username">
            <strong>{userInfo.name}</strong> 님, 게시글을 수정해보세요 💡
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
          수정 완료
        </button>
      </form>
    </div>
  );
}

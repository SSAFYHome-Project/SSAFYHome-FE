import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import logoImg from "../assets/img/logo-feedback.png";
import "../styles/CommunityWrite.css";

export default function CommunityWrite() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("부동산");
  const [userInfo, setUserInfo] = useState<{ name: string; profile: string } | null>(null);
  const categories = ["부동산", "청약", "안전매물", "안전지역", "기타"];
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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
      .then((res) => setUserInfo(res.data))
      .catch((err) => {
        console.error("사용자 정보 조회 실패:", err);
        alert("사용자 정보를 불러오지 못했습니다.");
        navigate("/community");
      });
  }, [navigate]);

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPreviewUrls((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    setImages((prev) => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("category", category);
    images.forEach((image) => formData.append("images", image));

    try {
      await axios.post("/api/community/board", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/community");
    } catch (err) {
      console.error("글 작성 실패:", err);
      alert("글 작성에 실패했습니다.");
    }
  };

  return (
    <div className="community-write-container">
      <img src={logoImg} alt="로고" className="community-logo" />

      {userInfo && (
        <div className="community-write-user">
          <img src={`data:image/png;base64,${userInfo.profile}`} alt="프로필" className="community-write-profile" />
          <div className="community-write-username">
            <strong>{userInfo.name}</strong> 님의 경험을 나눠주세요 💛
          </div>
        </div>
      )}

      <form className="community-write-form" onSubmit={handleSubmit}>
        <div className="community-category-wrapper">
          <button
            type="button"
            className={`community-category-badge ${category} selected`}
            onClick={() => setCategoryOpen((prev) => !prev)}
          >
            {category} ▾
          </button>

          {categoryOpen && (
            <div className="community-category-dropdown">
              {categories
                .filter((cat) => cat !== category)
                .map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`community-category-badge ${cat}`}
                    onClick={() => {
                      setCategory(cat);
                      setCategoryOpen(false);
                    }}
                  >
                    {cat}
                  </button>
                ))}
            </div>
          )}
        </div>

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

        <div {...getRootProps()} className={`community-dropzone ${isDragActive ? "active" : ""}`}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>이미지를 여기에 놓으세요...</p>
          ) : (
            <p>클릭하거나 이미지를 끌어다 놓아 업로드할 수 있어요.</p>
          )}
        </div>

        {previewUrls.length > 0 && (
          <div className="community-image-preview-wrapper">
            {previewUrls.map((url, idx) => (
              <div key={idx} className="community-image-preview">
                <img src={url} alt={`미리보기 ${idx + 1}`} />
              </div>
            ))}
          </div>
        )}

        <div className="community-write-actions">
          <button type="submit" className="community-write-submit">
            등록하기
          </button>
          <button type="button" className="community-write-cancel" onClick={() => navigate("/community")}>
            뒤로 가기
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect, FormEvent, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import logoImg from "../assets/img/logo-feedback.png";
import "../styles/CommunityWrite.css";
import aptImg from "../assets/img/apt.png";
import applyImg from "../assets/img/apply.png";
import safeImg from "../assets/img/safe.png";
import loactionImg from "../assets/img/location.png";
import etcImg from "../assets/img/etc.png";
import { FiArrowLeft } from "react-icons/fi";

export default function CommunityWrite() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("부동산");
  const [selectedSub, setSelectedSub] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<{ name: string; profile: string } | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const isFormValid = category && title.trim() && content.trim();
  const [currentTime, setCurrentTime] = useState<string>("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const STORAGE_KEY = 'community-write-draft';

  const saveToLocalStorage = () => {
    const draft = {
      title,
      content,
      category,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setSavedAt(draft.savedAt);
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (window.confirm('이전에 작성 중이던 글이 있습니다. 불러올까요?')) {
        setTitle(parsed.title);
        setContent(parsed.content);
        setCategory(parsed.category);
        setSavedAt(parsed.savedAt);
        editorRef.current?.getInstance().setHTML(parsed.content);
      }
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const categoryMap = {
    부동산: { icon: aptImg, subs: ["분양권", "매매", "전세", "월세"] },
    청약: { icon: applyImg, subs: ["특별공급", "일반공급", "청약꿀팁"] },
    안전매물: { icon: safeImg, subs: ["직접 방문", "실거주 확인"] },
    안전지역: { icon: loactionImg, subs: ["치안", "학교", "생활 편의"] },
    기타: { icon: etcImg, subs: ["Q&A", "자유게시판", "공지사항"] },
  };

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const editorRef = useRef<Editor>(null);

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
      localStorage.removeItem(STORAGE_KEY);
      navigate("/community");
    } catch (err) {
      console.error("글 작성 실패:", err);
      alert("글 작성에 실패했습니다.");
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedUrls = [...previewUrls];
    updatedUrls.splice(index, 1);
    setPreviewUrls(updatedUrls);
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  return (
    <div className="community-write-container">

      <button className="back-icon-button" onClick={() => navigate(-1)}>
        <FiArrowLeft size={25} color="#555" />
      </button>

      {userInfo && (
        <div className="community-write-user">
          <img
            src={`data:image/png;base64,${userInfo.profile}`}
            alt="프로필"
            className="community-write-profile"
          />
          <div className="community-write-username">
            <strong>{userInfo.name}</strong> 님의 경험을 나눠주세요. 💛
          </div>
        </div>
      )}

      <form className="community-write-form" onSubmit={handleSubmit}>
        <button
          type="button"
          className={`category-selected-button category`}
          onClick={() => setCategoryOpen(true)}
        >
          카테고리 · {category}
          <span className="dropdown-icon">▾</span>
        </button>

        {categoryOpen && (
          <div className="community-category-toolbar">
            <div className="community-category-list">
              {Object.entries(categoryMap).map(([cat, { icon, subs }]) => (
                <div
                  key={cat}
                  className={`category-card${category === cat ? ` selected category-${cat}` : ''}`}
                  onClick={() => {
                    setCategory(cat);
                    setSelectedSub([]);
                    setCategoryOpen(false);
                  }}
                >
                  <div className="category-header">
                    <img src={icon} alt={cat} className="category-icon" />
                    <span className={`community-category-badge`}>{cat}</span>
                  </div>

                  <div className="subcategory-list">
                    {subs.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        className={`subcategory-pill ${selectedSub.includes(sub) ? "selected" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="community-write-input"
          required
        />

        <Editor
          ref={editorRef}
          previewStyle="tab"
          height="500px"
          initialEditType="markdown"
          hideModeSwitch={false}
          useCommandShortcut={true}
          language="en-US"
          plugins={[colorSyntax]}
          toolbarItems={[
            ['heading', 'bold', 'italic', 'strike'],
            ['hr', 'quote'],
            ['ul', 'ol', 'task'],
            ['table', 'link'],
            ['image', 'code', 'codeblock'],
            ['scrollSync'],
          ]}
          onChange={() => {
            const data = editorRef.current?.getInstance().getHTML();
            setContent(data || '');
          }}
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
          <div className={`image-count-${previewUrls.length} community-image-preview-wrapper`}>
            {previewUrls.map((url, idx) => (
              <div key={idx} className="community-image-preview">
                <img src={url} alt={`미리보기 ${idx + 1}`} />
                <button className="delete-image-btn" onClick={() => handleRemoveImage(idx)}>×</button>
              </div>
            ))}
          </div>
        )}

        <div className="community-write-actions">
          <button
            type="submit"
            className={`community-write-submit ${isFormValid ? "active" : ""}`}
            disabled={!isFormValid}
          >
            등록하기
          </button>
          <button
            type="button"
            className="community-write-cancel"
            onClick={saveToLocalStorage}
          >
            임시 저장
          </button>
        </div>

        <div className="community-write-footer">
          <span>현재 작성 중인 시간: {currentTime}</span><br />
          {savedAt && (
            <span>📝 마지막 임시 저장: {new Date(savedAt).toLocaleTimeString('ko-KR')}</span>
          )}
        </div>
      </form>
    </div>
  );
}

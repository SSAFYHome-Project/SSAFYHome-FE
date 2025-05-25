import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import defaultProfile from "../assets/img/user.png";
import logoImg from "../assets/img/logo-feedback.png";
import "../styles/CommunityWrite.css";
import '@toast-ui/editor/dist/toastui-editor.css';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import { Editor as EditorCore } from '@toast-ui/editor';
import aptImg from "../assets/img/apt.png";
import applyImg from "../assets/img/apply.png";
import safeImg from "../assets/img/safe.png";
import loactionImg from "../assets/img/location.png";
import etcImg from "../assets/img/etc.png";
import { FiArrowLeft } from "react-icons/fi";
import { useDropzone } from "react-dropzone";
import { Editor } from '@toast-ui/react-editor';
import TurndownService from 'turndown';

export default function CommunityEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [HTML, setHTML] = useState("");
  const [initialMarkdownLoaded, setInitialMarkdownLoaded] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; profile: string } | null>(null);
  const token = localStorage.getItem("accessToken");
  const editorRef = useRef<Editor>(null);
  const [category, setCategory] = useState("부동산");
  const [selectedSub, setSelectedSub] = useState<string[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const isFormValid = category && title.trim() && markdown.trim();

  const categoryMap = {
    부동산: { icon: aptImg, subs: ["분양권", "매매", "전세", "월세"] },
    청약: { icon: applyImg, subs: ["특별공급", "일반공급", "청약꿀팁"] },
    안전매물: { icon: safeImg, subs: ["직접 방문", "실거주 확인"] },
    안전지역: { icon: loactionImg, subs: ["치안", "학교", "생활 편의"] },
    기타: { icon: etcImg, subs: ["Q&A", "자유게시판", "공지사항"] },
  };

  useEffect(() => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    axios.get("/api/user/info", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setUserInfo(res.data))
      .catch((err) => {
        console.error("사용자 정보 조회 실패:", err);
        navigate("/community");
      });

    const post = location.state?.post;
    const turndownService = new TurndownService();

    if (post) {
      setTitle(post.boardTitle);
      setCategory(post.boardCategory);
      setPreviewUrls(post.imageUrls || []);
      const md = turndownService.turndown(post.boardContent || "");
      setMarkdown(md);
      setInitialMarkdownLoaded(true);
      console.log(post);
    } else if (id) {
      axios.get(`/api/community/board/${id}`)
        .then((res) => {
          setTitle(res.data.boardTitle);
          setCategory(res.data.category);
          setPreviewUrls(res.data.imageUrls || []);
          const md = turndownService.turndown(res.data.boardContent || "");
          setMarkdown(md);
          setInitialMarkdownLoaded(true);
          console.log(res.data);
        })
        .catch((err) => {
          console.error("글 정보 불러오기 실패:", err);
          navigate("/community");
        });
    }
  }, [navigate, id, location.state, token]);

  useEffect(() => {
  if (initialMarkdownLoaded && editorRef.current) {
    const instance = editorRef.current.getInstance();
    if (instance) {
      instance.setMarkdown(markdown, false); 
    }
  }
}, [initialMarkdownLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("로그인이 필요합니다.");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", HTML);
      // formData.append("markdown", markdown);
      formData.append("category", category);
      formData.append("existingImages", JSON.stringify(previewUrls));
      images.forEach((file) => formData.append("images", file));

      await axios.patch(`/api/community/board/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("수정이 완료되었습니다.");
      navigate("/community-detail", { state: { id } });
    } catch (err) {
      console.error("수정 실패:", err);
      alert("글 수정에 실패했습니다.");
    }
  };

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
            src={`data:image/png;base64,${userInfo.profile || defaultProfile}`}
            alt="프로필"
            className="community-write-profile"
          />
          <span className="community-write-username">
            <strong>{userInfo.name}</strong> 님, 게시글을 수정해보세요. 💡
          </span>
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
                        onClick={(e) => e.stopPropagation()}
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
            const contentMd = editorRef.current?.getInstance().getMarkdown();
            setMarkdown(contentMd || '');

            const data = editorRef.current?.getInstance().getHTML();
            setHTML(data || '');
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

        <button
          type="submit"
          className={`community-write-submit ${isFormValid ? "active" : ""}`}
          disabled={!isFormValid}
        >
          수정 완료
        </button>
      </form>
    </div>
  );
}

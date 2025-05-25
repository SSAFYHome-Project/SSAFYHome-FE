import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import sampleImage1 from "../assets/img/sample1.png";
import sampleImage2 from "../assets/img/sample2.png";
import sampleImage3 from "../assets/img/sample3.png";
import sampleImage4 from "../assets/img/sample4.jpg";
import sampleImage5 from "../assets/img/sample5.jpg";
import sampleImage6 from "../assets/img/sample6.jpg";
import sampleImage7 from "../assets/img/sample7.jpg";
import logoImg from "../assets/img/logo-feedback.png";
import "../styles/Community.css";
import aptImg from "../assets/img/apt.png";
import applyImg from "../assets/img/apply.png";
import safeImg from "../assets/img/safe.png";
import loactionImg from "../assets/img/location.png";
import etcImg from "../assets/img/etc.png";
import FortuneBox from "./FortuneBox";

const dummyImages = [sampleImage1, sampleImage2, sampleImage3, sampleImage4, sampleImage5, sampleImage6, sampleImage7];

export default function Community() {
  type Post = {
    id: number;
    title: string;
    date: string;
    author: string;
    image: string;
    category: string;
    profile: string;
    view: number;
  };

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const categories = ["전체", "부동산", "청약", "안전매물", "안전지역", "기타"];
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const navigate = useNavigate();
  const topViewedPosts = [...posts].sort((a, b) => b.view - a.view).slice(0, 5);

  const categoryMap = {
    부동산: { icon: aptImg, subs: ["분양권", "매매", "전세", "월세"] },
    청약: { icon: applyImg, subs: ["특별공급", "일반공급", "청약꿀팁"] },
    안전매물: { icon: safeImg, subs: ["직접 방문", "실거주 확인"] },
    안전지역: { icon: loactionImg, subs: ["치안", "학교", "생활 편의"] },
    기타: { icon: etcImg, subs: ["Q&A", "자유게시판", "공지사항"] },
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) setIsLoggedIn(true);

    axios
      .get("/api/community/board")
      .then((res) => {
        const data = res.data;
        const enriched = data.map((item, idx) => ({
          id: item.boardIdx,
          title: item.boardTitle,
          date: item.boardRegDate.split(" ")[0],
          category: item.boardCategory,
          author: item.username,
          profile: `data:image/png;base64,${item.profile}`,
          image: item.imageUrl || dummyImages[idx % dummyImages.length],
          view: item.boardView,
        }));
        setPosts(enriched);
      })
      .catch((error) => {
        console.error("게시글 불러오기 실패:", error);
      });
  }, []);

  const filteredPosts = selectedCategory === "전체"
    ? posts
    : posts.filter((post) => post.category === selectedCategory);

  return (
    <div className="community-section">
      <img src={logoImg} alt="지도밖은위험해 로고" className="community-logo-main" />

      <div className="community-header">
        <div className="community-header-left">
          <h2 className="community-subtitle">방금 올라온 콘텐츠</h2>
          <p className="community-subtext">실시간 업데이트 소식 살펴보기</p>
        </div>

        {isLoggedIn && (
          <div className="community-write-wrapper">
            <a href="/community-write">
              <button className="community-write-button">+ 글 작성하기</button>
            </a>
          </div>
        )}
      </div>



      <div className="community-block">

        {/* <div className="community-category-cards">
        {Object.entries(categoryMap).map(([cat, { icon, subs }]) => (
          <div
            key={cat}
            className={`category-card ${selectedCategory === cat ? "selected" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            <div className="category-header">
              <img src={icon} alt={cat} className="category-icon" />
              <span className="community-category-badge">{cat}</span>
            </div>
            <div className="subcategory-list">
              {subs.map((sub) => (
                <span key={sub} className="subcategory-pill">{sub}</span>
              ))}
            </div>
          </div>
        ))}
      </div> */}

        <div className="community-list">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="community-item"
              onClick={() => navigate("/community-detail", { state: { id: post.id } })}
            >
              <div className="community-info">
                <span className="community-subcategory">
                  {post.category}
                </span>
                <h3 className="community-title">{post.title}</h3>
                <p className="community-date">
                  <img src={post.profile} alt="프로필" className="community-profile-image" />
                  {post.author} · {post.date}
                </p>
              </div>
              <div className="community-image-wrapper">
                <img src={post.image} alt="게시글 이미지" className="community-image" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="community-row">
        <div className="community-left">
          <h2 className="community-subtitle">지금 많이 보는 콘텐츠</h2>
          <p className="community-subtext">사람들이 주목하는 안전 지역 부동산 이야기</p>
          <ul className="community-list-simple">
            {topViewedPosts.map((post, index) => (
              <li key={post.id} className="community-simple-item">
                <span className="community-rank">{index + 1}</span>
                <span className="community-simple-title">{post.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="community-right">
          <h2 className="community-subtitle">오늘의 금전운</h2>
          <p className="community-subtext">하루에 한 번만 뽑을 수 있어요</p>

          <div className="fortune-box-wrapper">
            <FortuneBox />
          </div>
        </div>
      </div>
    </div>
  );
}

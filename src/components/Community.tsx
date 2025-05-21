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
import FortuneBox from "./FortuneBox";

const dummyImages = [sampleImage1, sampleImage2, sampleImage3, sampleImage4, sampleImage5, sampleImage6, sampleImage7];

export default function Community() {
  type Post = {
    id: number;
    title: string;
    date: string;
    author: string;
    image: string;
  };

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const getActiveClass = (path: string) => (location.pathname === path ? "active" : "");
  const navigate = useNavigate();

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
          author: item.username,
          image: dummyImages[idx % dummyImages.length],
        }));
        setPosts(enriched);
      })
      .catch((error) => {
        console.error("게시글 불러오기 실패:", error);
      });
  }, []);

  return (
    <div className="community-section">
      <img src={logoImg} alt="지도밖은위험해 로고" className="community-logo" />

      {isLoggedIn && (
        <div className="community-write-wrapper">
          <a href="/community-write" className={getActiveClass("/community-write")}>
            <button className="community-write-button">글 작성하기</button>
          </a>
        </div>
      )}

      <div className="community-block">
        <h2 className="community-subtitle">방금 올라온 콘텐츠</h2>
        <p className="community-subtext">실시간 업데이트 소식 살펴보기</p>
        <div className="community-list">
          {posts.map((post) => (
            <div
              key={post.id}
              className="community-item"
              onClick={() => navigate("/community-detail", { state: { id: post.id } })}
            >
              <div className="community-info">
                <h3 className="community-title">{post.title}</h3>
                <p className="community-date">
                  {post.date} · {post.author}
                </p>
              </div>
              <div className="community-image-wrapper">
                <img src={post.image} alt="" className="community-image" />
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
            {posts.slice(0, 5).map((post, index) => (
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
          <FortuneBox />
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../styles/Header.css";

interface UserInfo {
  name: string;
  profile: string;
}

const Header = () => {
  const location = useLocation();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const getActiveClass = (path: string) => (location.pathname === path ? "active" : "");

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("/api/user/info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (error) {
        console.error("유저 정보 불러오기 실패:", error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <header className="header">
      <div className="logo-area">
        <a href="/">
          <img src="/SSAFYHome_logo.png" alt="logo" className="logo" />
        </a>
      </div>

      <nav className="menu">
        <a href="/" className={getActiveClass("/")}>
          안전지역
        </a>
        <a href="/news" className={getActiveClass("/news")}>
          뉴스
        </a>
        <a href="/missing" className={getActiveClass("/missing")}>
          실종아동 찾기
        </a>
      </nav>

      <div className="auth-area">
  {location.pathname === "/login" || location.pathname === "/register" ? (
    <a href="/" className={getActiveClass("/")}>
      <button className="login-button">메인화면</button>
    </a>
  ) : userInfo ? (
    <div className="user-info">
      <img
        src={`data:image/png;base64,${userInfo.profile}`}
        alt="프로필"
        className="profile-img"
      />
      <span className="user-info-name">{userInfo.name}</span>
      <span>님</span>
    </div>
  ) : (
    <a href="/login" className={getActiveClass("/login")}>
      <button className="login-button">로그인</button>
    </a>
  )}
</div>

    </header>
  );
};

export default Header;

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Header.css";

interface UserInfo {
  isLoggedIn: boolean;
  name: string;
  profile: string;
}

const Header = () => {
  const location = useLocation();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getActiveClass = (path: string) => (location.pathname === path ? "active" : "");
  const navigate = useNavigate();

  useEffect(() => {
    const getUserInfo = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const response = await axios.get("/api/user/info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserInfo({
          isLoggedIn: true,
          name: response.data.name,
          profile: response.data.profile,
        });
      } catch (error) {
        console.error("유저 정보 불러오기 실패:", error);
        setUserInfo({
          isLoggedIn: false,
          name: "",
          profile: "",
        });
      }
    };

    getUserInfo();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".user-info")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/";
  };

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
        <a href="/community" className={getActiveClass("/community")}>
          커뮤니티
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
        ) : userInfo?.isLoggedIn ? (
          <div className="user-info" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <img src={`data:image/png;base64,${userInfo.profile}`} alt="프로필" className="profile-img" />
            <span className="user-info-name">
              <strong>{userInfo.name}</strong>
            </span>
            <span className="user-info-suffix">님</span>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <img src={`data:image/png;base64,${userInfo.profile}`} alt="프로필" className="profile-img" />
                <span className="greeting">
                  <strong>{userInfo.name}</strong> 님, 안녕하세요!
                </span>
                <button className="info-btn" onClick={() => navigate("/info")}>
                  내 정보 수정
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                  로그아웃
                </button>
              </div>
            )}
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

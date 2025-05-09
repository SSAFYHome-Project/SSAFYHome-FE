import { useLocation } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  const location = useLocation();

  const getActiveClass = (path: string) => (location.pathname === path ? "active" : "");

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
      <a href="/login" className={getActiveClass("/login")}>
        <button className="login-button">로그인</button>
      </a>
    </header>
  );
};

export default Header;

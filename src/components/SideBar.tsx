import { useState } from "react";
import "../styles/Sidebar.css";

import toggleIcon from "../assets/img/toggle.png";
import infoIcon from "../assets/img/info.png";
import heartIcon from "../assets/img/heart.png";
import eyeIcon from "../assets/img/eye.png";
import customIcon from "../assets/img/custom.png";
import mailIcon from "../assets/img/mail.png";

interface SidebarProps {
  activeSidebar: "detail" | "favorite" | "recent" | "custom" | "feedback" | null;
  setActiveSidebar: React.Dispatch<
    React.SetStateAction<"detail" | "favorite" | "recent" | "custom" | "feedback" | null>
  >;
}

const Sidebar = ({ activeSidebar, setActiveSidebar }: SidebarProps) => {
  const isExpanded = activeSidebar !== null;

  const handleToggle = () => {
    setActiveSidebar(null);
  };

  const handleMenuClick = (key: SidebarProps["activeSidebar"]) => {
    setActiveSidebar((prev) => (prev === key ? null : key));
  };

  return (
    <aside className={`sidebar ${isExpanded ? "expanded" : ""}`}>
      <div className="sidebar-top" onClick={handleToggle}>
        <img src={toggleIcon} alt="토글" className="sidebar-icon" />
      </div>

      <nav className="sidebar-menu">
        <div
          className={`sidebar-item ${activeSidebar === "detail" ? "active" : ""}`}
          onClick={() => handleMenuClick("detail")}
        >
          <img src={infoIcon} alt="상세 정보" className="sidebar-icon" />
          <span>상세 정보</span>
        </div>
        <div
          className={`sidebar-item ${activeSidebar === "favorite" ? "active" : ""}`}
          onClick={() => handleMenuClick("favorite")}
        >
          <img src={heartIcon} alt="관심" className="sidebar-icon" />
          <span>관심</span>
        </div>
        <div
          className={`sidebar-item ${activeSidebar === "recent" ? "active" : ""}`}
          onClick={() => handleMenuClick("recent")}
        >
          <img src={eyeIcon} alt="최근 본" className="sidebar-icon" />
          <span>최근 본</span>
        </div>
        <div
          className={`sidebar-item ${activeSidebar === "custom" ? "active" : ""}`}
          onClick={() => handleMenuClick("custom")}
        >
          <img src={customIcon} alt="맞춤형 매물" className="sidebar-icon" />
          <span>맞춤형</span>
          <span>매물</span>
        </div>
      </nav>

      <div className="sidebar-bottom">
        <div
          className={`sidebar-item ${activeSidebar === "feedback" ? "active" : ""}`}
          onClick={() => handleMenuClick("feedback")}
        >
          <img src={mailIcon} alt="의견 보내기" className="sidebar-icon" />
          <span>의견</span>
          <span>보내기</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

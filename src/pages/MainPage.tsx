import { useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FiilterBar";
import AISummaryButton from "../components/AISummaryButton";
import SideBar from "../components/SideBar";

import SidebarDetail from "../components/sidebar-panels/SidebarDetail";
import SidebarFavorite from "../components/sidebar-panels/SidebarFavorite";
import SidebarRecent from "../components/sidebar-panels/SidebarRecent";
import SidebarCustom from "../components/sidebar-panels/SidebarCustom";
import SidebarFeedback from "../components/sidebar-panels/SidebarFeedback";

import "../styles/MainPage.css";

const MainPage = () => {
  const [hasResult, setHasResult] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<null | "detail" | "favorite" | "recent" | "custom" | "feedback">(
    null
  );

  const handleResult = () => {
    setHasResult(true);
  };

  return (
    <div className="main-wrapper">
      <div className="sidebar-fixed">
        <SideBar setActiveSidebar={setActiveSidebar} activeSidebar={activeSidebar} />
        {activeSidebar === "detail" && <SidebarDetail />}
        {activeSidebar === "favorite" && <SidebarFavorite />}
        {activeSidebar === "recent" && <SidebarRecent />}
        {activeSidebar === "custom" && <SidebarCustom />}
        {activeSidebar === "feedback" && <SidebarFeedback />}
      </div>

      <div className={`main-content ${activeSidebar ? "with-sidebar-panel" : ""}`}>
        <Header />
        <div className="main-layout">
          <div className="top-bar">
            <SearchBar onSearchComplete={handleResult} />
            <FilterBar onFilterComplete={handleResult} />
            <AISummaryButton isVisible={hasResult} />
          </div>
          <div className="map-view">{/* $<MapView /> */}</div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

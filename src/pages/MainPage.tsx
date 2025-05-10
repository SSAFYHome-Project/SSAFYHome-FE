import { useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar"; // ✅ 오타 수정: FiilterBar → FilterBar
import AISummaryButton from "../components/AISummaryButton";
import SideBar from "../components/SideBar";

import SidebarDetail from "../components/sidebar-panels/SidebarDetail";
import SidebarFavorite from "../components/sidebar-panels/SidebarFavorite";
import SidebarRecent from "../components/sidebar-panels/SidebarRecent";
import SidebarCustom from "../components/sidebar-panels/SidebarCustom";
import SidebarFeedback from "../components/sidebar-panels/SidebarFeedback";

import MapView from "../components/MapView";

import "../styles/MainPage.css";

const MainPage = () => {
  const [hasResult, setHasResult] = useState(false);
  const [filterValues, setFilterValues] = useState<{
    sido: string;
    gugun: string;
    dong: string;
    yyyymm: string;
  } | null>(null);

  const [activeSidebar, setActiveSidebar] = useState<null | "detail" | "favorite" | "recent" | "custom" | "feedback">(null);

  const handleResult = (filters: {
    sido: string;
    gugun: string;
    dong: string;
    yyyymm: string;
  }) => {
    setHasResult(true);
    setFilterValues(filters);
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
            <SearchBar onSearchComplete={() => setHasResult(true)} />
            <FilterBar onFilterChange={handleResult} /> {/* ✅ 수정: onFilterComplete → onFilterChange */}
            <AISummaryButton isVisible={hasResult} />
          </div>
          <div className="map-view">
            <MapView filterValues={filterValues} /> {/* ✅ 필터 전달 */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

import { useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import AISummaryButton from "../components/AISummaryButton";
import SideBar from "../components/SideBar";

import SidebarDetail from "../components/sidebar-panels/SidebarDetail";
import SidebarFavorite from "../components/sidebar-panels/SidebarFavorite";
import SidebarRecent from "../components/sidebar-panels/SidebarRecent";
import SidebarCustom from "../components/sidebar-panels/SidebarCustom";
import SidebarFeedback from "../components/sidebar-panels/SidebarFeedback";

import MapView from "../components/MapView";
import AISummary from "../components/AISummary";
import SafetyGrade from "../components/SafetyGrade";

import "../styles/MainPage.css";

type Filters = {
  sido: string;
  gugun: string;
  dong: string;
  regionCode: string;
  yyyymm: string;
};

const MainPage = () => {
  const [hasResult, setHasResult] = useState(false);
  const [filterValues, setFilterValues] = useState<Filters | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<null | "detail" | "favorite" | "recent" | "custom" | "feedback">(
    null
  );

  const handleSearchResult = (filters: Filters) => {
    console.log("검색 필터:", filters);
    setHasResult(true);
    setFilterValues(filters);
  };

  const handleFilterApply = (filters: Filters) => {
    console.log("필터바 필터:", filters);
    setHasResult(true);
    setFilterValues(filters);
  };

  const sidebarPanels = {
    detail: <SidebarDetail />,
    favorite: <SidebarFavorite />,
    recent: <SidebarRecent />,
    custom: <SidebarCustom />,
    feedback: <SidebarFeedback />,
  };

  const summaryText = `서울 강남구 삼성동에는 총 8개의 매물이 확인되었습니다.
실거래가는 35억부터 42억 사이로 형성되어 있으며, 평균 가격은 약 38억 5천만 원입니다.
전용면적은 대부분 121.93m²로 넓은 편이고, 12층 이상의 고층 매물도 다수 포함되어 있습니다.

안전등급은 선호 3건, 양호 2건, 위험 1건으로 분포되어 전반적으로 안정적인 주거 환경을 갖추고 있습니다.

반경 1km 이내에는 초·중·고등학교가 5곳 있으며,
지하철 2호선 삼성역까지는 도보 약 10분 거리입니다.

롯데월드, 코엑스몰, 대형마트, 병원 등 주요 편의시설이 가까워 실거주를 고려하시는 분들께 적합한 입지입니다.`;

  return (
    <div className="main-wrapper">
      <div className="sidebar-fixed">
        <SideBar setActiveSidebar={setActiveSidebar} activeSidebar={activeSidebar} />
        {activeSidebar && sidebarPanels[activeSidebar]}
      </div>

      <div className={`main-content ${activeSidebar ? "with-sidebar-panel" : ""}`}>
        <Header />
        <div className="main-layout">
          <div className="top-bar">
            <SearchBar onFilterChange={handleSearchResult} />
            <FilterBar onFilterChange={handleFilterApply} />
            <AISummaryButton isVisible={hasResult} onClick={() => setShowSummary(true)} />
          </div>
          <div className="map-view">
            <MapView filterValues={filterValues} />
          </div>
        </div>
      </div>

      {showSummary && <AISummary summaryText={summaryText} onClose={() => setShowSummary(false)} />}

      {hasResult && <SafetyGrade />}
    </div>
  );
};

export default MainPage;

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
import PropertyCardList from "../components/PropertyCardList";
import SidebarBlock from "../components/sidebar-panels/SidebarBlock";
import SidebarEmpty from "../components/sidebar-panels/SidebarEmpty";

import "../styles/MainPage.css";

type Filters = {
  sido: string;
  gugun: string;
  dong: string;
  regionCode: string;
  yyyymm: string;
};

type DealItem = {
  aptName: string;
  dealAmount?: string;
  deposit?: string;
  area: string;
  floor: string;
  umdNm: string;
  monthlyRent?: string;
  aptCode?: string;
  sggCd: string;
  jibun: string;
};

const MainPage = () => {
  const [hasResult, setHasResult] = useState(false);
  const [filterValues, setFilterValues] = useState<Filters | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState<null | "detail" | "favorite" | "recent" | "custom" | "feedback">(
    null
  );
  const [activeTab, setActiveTab] = useState<"trade" | "rent">("trade");
  const [tradeItems, setTradeItems] = useState<DealItem[]>([]);
  const [rentItems, setRentItems] = useState<DealItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DealItem | null>(null);
  const [sortOption, setSortOption] = useState<"price-asc" | "price-desc" | "area-asc" | "area-desc">("price-asc");

  const handleSearchResult = (filters: Filters) => {
    setHasResult(true);
    setFilterValues(filters);
  };

  const handleFilterApply = (filters: Filters) => {
    setHasResult(true);
    setFilterValues(filters);
  };

  const isLoggedIn = !!localStorage.getItem("accessToken");

  const sidebarPanels = {
    detail: selectedItem ? (
      <SidebarDetail onCloseSidebar={() => setActiveSidebar(null)} item={selectedItem} />
    ) : (
      <SidebarEmpty onCloseSidebar={() => setActiveSidebar(null)} />
    ),
    favorite: isLoggedIn ? (
      <SidebarFavorite />
    ) : (
      <SidebarBlock onCloseSidebar={() => setActiveSidebar(null)} message="관심 매물 확인은" />
    ),
    recent: isLoggedIn ? (
      <SidebarRecent />
    ) : (
      <SidebarBlock onCloseSidebar={() => setActiveSidebar(null)} message="최근 본 매물 조회는" />
    ),
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

  const getNum = (val: string | undefined) => parseFloat((val ?? "0").replace(/,/g, ""));

  const sortedItems = [...(activeTab === "trade" ? tradeItems : rentItems)];

  const sortOptions = [
    { value: "price-desc", label: "가격 높은 순" },
    { value: "price-asc", label: "가격 낮은 순" },
    { value: "area-desc", label: "평수 높은 순" },
    { value: "area-asc", label: "평수 낮은 순" },
  ];

  if (activeTab === "trade") {
    sortedItems.sort((a, b) => {
      let valA = 0,
        valB = 0;

      if (sortOption.startsWith("price")) {
        valA = getNum(a.dealAmount);
        valB = getNum(b.dealAmount);
      } else {
        valA = getNum(a.area);
        valB = getNum(b.area);
      }

      return sortOption.endsWith("asc") ? valA - valB : valB - valA;
    });
  } else {
    sortedItems.sort((a, b) => {
      let valA = 0,
        valB = 0;

      if (sortOption.startsWith("area")) {
        valA = getNum(a.area);
        valB = getNum(b.area);

        return sortOption.endsWith("asc") ? valA - valB : valB - valA;
      }

      return 0;
    });
  }

  return (
    <div className="main-wrapper">
      <div className="sidebar-fixed">
        <SideBar setActiveSidebar={setActiveSidebar} activeSidebar={activeSidebar} />
        {activeSidebar && sidebarPanels[activeSidebar]}
      </div>

      <div className={`main-content ${activeSidebar ? "with-sidebar-panel" : ""}`}>
        <Header isLoggedIn={isLoggedIn} />
        <div className="main-layout">
          <div className="top-bar">
            <SearchBar onFilterChange={handleSearchResult} />
            <FilterBar onFilterChange={handleFilterApply} />
            <AISummaryButton isVisible={hasResult} onClick={() => setShowSummary(true)} />
          </div>

          <div className="map-view">
            <MapView
              filterValues={filterValues}
              onUpdateDeals={(rawTrades: any[], rawRents: any[]) => {
                const normalizedTrades = rawTrades.map((item) => ({
                  aptName: item.aptNm,
                  dealAmount: item.dealAmount,
                  area: String(item.excluUseAr ?? "-"),
                  floor: String(item.floor ?? "-"),
                  umdNm: item.umdNm,
                  sggCd: item.sggCd,
                  jibun: item.jibun,
                }));
                const normalizedRents = rawRents.map((item) => ({
                  aptName: item.aptNm,
                  deposit: item.deposit,
                  monthlyRent: item.monthlyRent,
                  area: String(item.excluUseAr ?? "-"),
                  floor: String(item.floor ?? "-"),
                  umdNm: item.umdNm,
                  sggCd: item.sggCd,
                  jibun: item.jibun,
                }));
                setTradeItems(normalizedTrades);
                setRentItems(normalizedRents);
              }}
            />
          </div>

          {hasResult && (
            <>
              <div className="property-toggle-tabs-container">
                <div className="property-toggle-tabs">
                  <div className={`indicator ${activeTab}`} />
                  <button className={activeTab === "trade" ? "active" : ""} onClick={() => setActiveTab("trade")}>
                    매매 매물
                  </button>
                  <button className={activeTab === "rent" ? "active" : ""} onClick={() => setActiveTab("rent")}>
                    전월세 매물
                  </button>
                </div>
                <div className="sort-button-group">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`sort-button ${sortOption === option.value ? "active" : ""}`}
                      onClick={() => setSortOption(option.value as any)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="property-lists">
                {activeTab === "trade" && (
                  <PropertyCardList
                    title={activeTab === "trade" ? "매매 매물" : "전월세 매물"}
                    items={sortedItems}
                    onSelect={(item) => {
                      setSelectedItem(item);
                      setActiveSidebar("detail");
                    }}
                  />
                )}
                {activeTab === "rent" && (
                  <PropertyCardList
                    title={activeTab === "rent" ? "매매 매물" : "전월세 매물"}
                    items={sortedItems}
                    onSelect={(item) => {
                      setSelectedItem(item);
                      setActiveSidebar("detail");
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showSummary && <AISummary summaryText={summaryText} onClose={() => setShowSummary(false)} />}
      {hasResult && <SafetyGrade />}
    </div>
  );
};

export default MainPage;

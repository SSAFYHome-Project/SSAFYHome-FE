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
  const [activeType, setActiveType] = useState<"전체" | "매매" | "전월세">("전체");
  const [tradeItems, setTradeItems] = useState<DealItem[]>([]);
  const [rentItems, setRentItems] = useState<DealItem[]>([]);
  const [allItems, setAllItems] = useState<DealItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DealItem | null>(null);

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
              activeType={activeType}
              setActiveType={setActiveType}
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
                setAllItems([...normalizedTrades, ...normalizedRents]);
              }}
            />
          </div>

          {hasResult && (
            <div className="property-lists">
              {activeType === "매매" && (
                <PropertyCardList
                  title="매매 매물"
                  items={tradeItems}
                  onSelect={(item) => {
                    setSelectedItem(item);
                    setActiveSidebar("detail");
                  }}
                />
              )}
              {activeType === "전월세" && (
                <PropertyCardList
                  title="전월세 매물"
                  items={rentItems}
                  onSelect={(item) => {
                    setSelectedItem(item);
                    setActiveSidebar("detail");
                  }}
                />
              )}
              {activeType === "전체" && (
                <PropertyCardList
                  title="전체 매물"
                  items={allItems}
                  onSelect={(item) => {
                    setSelectedItem(item);
                    setActiveSidebar("detail");
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {showSummary && filterValues && (
        <AISummary
          sido={filterValues.sido}
          gigun={filterValues.gugun}
          umd={filterValues.dong}
          onClose={() => setShowSummary(false)}
        />
      )}
      {hasResult && <SafetyGrade />}
    </div>
  );
};

export default MainPage;

import { useEffect, useState } from "react";
import "../../styles/SideBarPanel.css";
import axios from "axios";

import heartHoverIcon from "../../assets/img/heart-filled.png";
import heartIcon from "../../assets/img/heart.png";
import PriceChart from "./PriceChart";

interface DealItem {
  aptName: string;
  dealAmount?: string;
  deposit?: string;
  area: string;
  floor: string;
  umdNm: string;
  monthlyRent?: string;
}

interface SidebarDetailProps {
  item: DealItem | null;
}

interface ChartItem {
  date: string;
  price: number;
}

const SidebarDetail = ({ item }: SidebarDetailProps) => {
  const [selectedType, setSelectedType] = useState<"매매" | "전월세">("매매");
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [hovered, setHovered] = useState(false);

  if (!item) {
    return (
      <div className="sidebar-panel">
        <div className="panel-header">
          <h2>매물 상세 조회</h2>
        </div>
        <div className="panel-header-subtitle">
          <p>
            아파트 매물 정보를 확인해보세요. <br />
            관심 매물 추가 / 삭제가 가능합니다.
          </p>
        </div>
        <p className="empty-text">매물 검색 후 상세 정보를 확인할 수 있습니다.</p>
      </div>
    );
  }

  const { aptName, dealAmount, deposit, area, floor, umdNm, monthlyRent } = item;

  // 더미 차트 데이터
  useEffect(() => {
    const dummyChartData = [
      { date: "24.11", price: 30.2 },
      { date: "24.12", price: 32.5 },
      { date: "25.01", price: 33.1 },
      { date: "25.02", price: 34.0 },
      { date: "25.03", price: 36.5 },
      { date: "25.04", price: 37.2 },
    ];
    setChartData(dummyChartData);
  }, [item]);

  const handleBookmark = async () => {
    try {
      await axios.post(
        "/api/user/bookmark",
        {
          aptNm: aptName,
          estateAgentAggNm: "중개사무소명",
          umdNm,
          dealAmount: parseInt(dealAmount ?? "0"),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      alert("즐겨찾기에 등록했어요! ❤️");
    } catch (error) {
      console.error("즐겨찾기 등록 실패:", error);
      alert("즐겨찾기 등록 중 오류가 발생했어요.");
    }
  };

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <h2>{aptName}</h2>
        <div
          className="favorite-box"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={handleBookmark}
        >
          <img src={hovered ? heartHoverIcon : heartIcon} alt="등록하기" className="heart-img" />
          <span className={`favorite-text ${hovered ? "hover" : ""}`}>등록하기</span>
        </div>
      </div>

      <p className="panel-subtitle">{`주소: ${umdNm}`}</p>
      <p className="panel-meta">{`면적: ${area}㎡ · 층수: ${floor}`}</p>

      <div className="panel-select-row">
        <button
          className={`btn-type ${selectedType === "매매" ? "active" : ""}`}
          onClick={() => setSelectedType("매매")}
        >
          매매
        </button>
        <button
          className={`btn-type ${selectedType === "전월세" ? "active" : ""}`}
          onClick={() => setSelectedType("전월세")}
        >
          전·월세
        </button>
        <select className="size-select">
          <option>전용 {area}㎡</option>
        </select>
      </div>

      <div className="panel-summary">
        <div className="summary-item">
          <div className="summary-label">
            <span className="summary-title">최근 실거래</span>
            <span className="summary-date">25.05.03</span>
          </div>
          <div className="price-row">
            <strong>
              {dealAmount ? `${dealAmount}만원` : deposit && monthlyRent ? `${deposit} / ${monthlyRent}만원` : "-"}
            </strong>
            <span className="summary-floor">({floor}층)</span>
          </div>
        </div>

        <div className="vertical-divider" />

        <div className="summary-item">
          <div className="summary-label">
            <span className="summary-title">매물 최저가</span>
            <span className="summary-date">25.05.03</span>
          </div>
          <div className="price-row">
            <strong>37.2억</strong>
            <span className="summary-floor">(12층)</span>
          </div>
        </div>
      </div>

      <div className="panel-chart">
        {chartData.length > 0 ? (
          <PriceChart data={chartData} />
        ) : (
          <p style={{ textAlign: "center", color: "#888" }}>차트 데이터 없음</p>
        )}
      </div>

      <div className="panel-table">
        <table>
          <thead>
            <tr>
              <th>거래일</th>
              <th>정보</th>
              <th>가격</th>
              <th>층</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2025.05.03</td>
              <td>{dealAmount ? "매매" : "전월세"}</td>
              <td>{dealAmount ? `${dealAmount}만원` : `${deposit} / ${monthlyRent}만원`}</td>
              <td>{floor}</td>
            </tr>
          </tbody>
        </table>
        <div className="pagination">&lt; 1 2 3 4 5 &gt;</div>
      </div>

      <p className="data-source">2025.05 국토교통부 기준</p>
    </div>
  );
};

export default SidebarDetail;

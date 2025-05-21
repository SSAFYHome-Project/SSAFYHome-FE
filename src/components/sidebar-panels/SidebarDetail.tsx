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
  aptCode?: string;
  sggCd?: string;
  jibun?: string;
}

interface SidebarDetailProps {
  item: DealItem | null;
  onCloseSidebar: () => void;
}

interface ChartItem {
  date: string;
  price: number;
}

const ITEMS_PER_PAGE = 7;

const SidebarDetail = ({ onCloseSidebar, item }: SidebarDetailProps) => {
  const [selectedType, setSelectedType] = useState<"매매" | "전월세">("매매");
  const [selectedArea, setSelectedArea] = useState<string>("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [hovered, setHovered] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetailData = async () => {
      if (!item || !item.aptName || !item.sggCd || !item.jibun) {
        onCloseSidebar();
        return;
      }
      const url = `/api/apt/detail?aptName=${encodeURIComponent(item.aptName)}&sggCd=${item.sggCd}&jibun=${item.jibun}`;

      setLoading(true);
      try {
        const response = await axios.get(url);
        setDetailData(response.data);
        setChartData(response.data.chartData || []);
      } catch (error: any) {
        console.error("API 요청 실패:", error);
        alert("데이터를 불러오지 못했습니다.");
        onCloseSidebar();
      } finally {
        setLoading(false);
      }
    };

    fetchDetailData();
  }, [item]);

  useEffect(() => {
    const postRecentItem = async () => {
      if (!item || !detailData) return;

      const dealInfo = {
        aptName: item.aptName,
        dealType: item.monthlyRent ? "RENT" : "TRADE",
        regionCode: detailData.doroJuso,
        jibun: item.jibun || "",
        deposit: parseInt(item.deposit ?? "0"),
        monthlyRent: parseInt(item.monthlyRent ?? "0"),
        dealAmount: parseInt(item.dealAmount ?? "0"),
        excluUseAr: parseFloat(item.area),
        dealYear: detailData.dealYear || new Date().getFullYear(),
        dealMonth: detailData.dealMonth || new Date().getMonth() + 1,
        dealDay: detailData.dealDay || new Date().getDate(),
        floor: parseInt(item.floor),
        buildYear: parseInt(detailData.kaptUsedate?.slice(0, 4) || "0"),
      };

      try {
        await axios.post("/api/user/recentView", dealInfo, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        console.log("최근 본 매물 등록 완료");
      } catch (error) {
        console.error("최근 본 매물 등록 실패:", error);
      }
    };

    postRecentItem();
  }, [item, detailData]);

  useEffect(() => {
    if (!detailData) return;
    const newChartData = selectedType === "매매" ? detailData.chartData : detailData.rentChartData;
    setChartData(newChartData || []);
    setCurrentPage(1);
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedType, detailData]);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  if (loading) {
    return (
      <div className="sidebar-panel">
        <div className="loading-container">
          <p className="loading-text">
            데이터를 불러오는 중입니다
            <span className="loading-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>
        </div>
      </div>
    );
  }

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

  const handleBookmark = async () => {
    if (!item || !detailData) return;

    const payload = {
      aptName: item.aptName,
      dealType: item.monthlyRent ? "RENT" : "TRADE",
      regionCode: detailData.doroJuso,
      jibun: item.jibun || "",
      deposit: parseInt(item.deposit ?? "0"),
      monthlyRent: parseInt(item.monthlyRent ?? "0"),
      dealAmount: parseInt(item.dealAmount ?? "0"),
      excluUseAr: parseFloat(item.area),
      dealYear: detailData.dealYear || new Date().getFullYear(),
      dealMonth: detailData.dealMonth || new Date().getMonth() + 1,
      dealDay: detailData.dealDay || new Date().getDate(),
      floor: parseInt(item.floor),
      buildYear: parseInt(detailData.kaptUsedate?.slice(0, 4) || "0"),
    };

    try {
      const response = await axios.post("/api/user/bookmark", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      alert("즐겨찾기에 등록되었습니다!");
    } catch (error) {
      console.error("즐겨찾기 등록 실패:", error);
      alert("즐겨찾기 등록 중 오류가 발생했어요.");
    }
  };

  const rawHistory = detailData?.history || [];
  const areaOptions = ["전체", ...new Set(rawHistory.map((row: any) => row.area))];
  const filtered = rawHistory.filter(
    (row: any) => row.type === selectedType && (selectedArea === "전체" || row.area === selectedArea)
  );
  const pagedData = filtered.slice(0, visibleCount);

  const recentDate = selectedType === "매매" ? detailData?.recentTradeDate : detailData?.recentRentDate;
  const recentPriceRaw = selectedType === "매매" ? detailData?.recentTradePrice : detailData?.recentRentPrice;
  const recentPrice = formatToDecimalEok(recentPriceRaw);
  const recentFloor = selectedType === "매매" ? detailData?.recentTradeFloor : detailData?.recentRentFloor;

  const lowestDate = selectedType === "매매" ? detailData?.lowestTradeDate : detailData?.lowestRentDate;
  const lowestPriceRaw = selectedType === "매매" ? detailData?.lowestTradePrice : detailData?.lowestRentPrice;
  const lowestPrice = formatToDecimalEok(lowestPriceRaw);
  const lowestFloor = selectedType === "매매" ? detailData?.lowestTradeFloor : detailData?.lowestRentFloor;

  function formatToDecimalEok(price: string | null | undefined): string {
    if (!price || price === "-") return "-";

    const cleaned = price.replace(/,/g, "");
    const eokMatch = cleaned.match(/(\d+)억/);
    const manMatch = cleaned.match(/(\d+)만원/);

    const eok = eokMatch ? parseInt(eokMatch[1]) : 0;
    const man = manMatch ? parseInt(manMatch[1]) : 0;

    const total = eok + man / 10000;
    return total % 1 === 0 ? `${total.toFixed(0)}억` : `${total.toFixed(1)}억`;
  }

  return (
    <div className="sidebar-panel">
      {detailData && (
        <>
          <div className="panel-header">
            <h2>{detailData.aptName}</h2>
            <div
              className="favorite-box"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onClick={handleBookmark}
            >
              <img src={hovered ? heartIcon : heartHoverIcon} alt="등록하기" className="heart-img" />
              <span className={`favorite-text ${hovered ? "hover" : ""}`}>등록하기</span>
            </div>
          </div>

          <p className="panel-subtitle">{detailData.doroJuso || "주소 정보 없음"}</p>
          <p className="panel-meta">
            건물 {detailData.kaptDongCnt || "-"}동 · {detailData.hoCnt || "-"}세대 · 최고{" "}
            {detailData.kaptTopFloor || "-"}F ·
            {detailData.kaptUsedate ? ` ${detailData.kaptUsedate.slice(0, 4)}년` : " -"}
          </p>

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

            <select
              className="size-select"
              value={selectedArea}
              onChange={(e) => {
                setSelectedArea(e.target.value);
                setCurrentPage(1);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
            >
              {areaOptions.map((area, idx) => (
                <option key={idx} value={area}>
                  전용 {area}
                </option>
              ))}
            </select>
          </div>

          <div className="panel-summary">
            <div className="summary-item">
              <div className="summary-label">
                <span className="summary-title">최근 실거래</span>
                <span className="summary-date">{recentDate || "-"}</span>
              </div>
              <div className="price-row">
                <strong>{recentPrice || "-"}</strong>
                <span className="summary-floor">({recentFloor || "-"})</span>
              </div>
            </div>

            <div className="vertical-divider" />

            <div className="summary-item">
              <div className="summary-label">
                <span className="summary-title">매물 최저가</span>
                <span className="summary-date">{lowestDate || "-"}</span>
              </div>
              <div className="price-row">
                <strong>{lowestPrice || "-"}</strong>
                <span className="summary-floor">({lowestFloor || "-"})</span>
              </div>
            </div>
          </div>

          <div className="panel-chart">
            {chartData.length > 0 ? (
              <PriceChart data={chartData} />
            ) : (
              <p style={{ textAlign: "center", color: "#888", marginLeft: "40px" }}>차트 데이터 없음</p>
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
                {pagedData.length > 0 ? (
                  pagedData.map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td>{row.date}</td>
                      <td>{row.type === "매매" ? "매매" : row.price.includes("월세") ? "월세" : "전세"}</td>
                      <td>{row.type === "전월세" ? row.price.slice(0, -4) : row.price}</td>
                      <td>{row.floor}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "#888", marginLeft: "40px" }}>
                      거래 이력이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {visibleCount < filtered.length && (
              <div className="show-more-container">
                <button className="show-more-button" onClick={handleShowMore}>
                  더보기 +
                </button>
              </div>
            )}
          </div>

          <p className="data-source">2025.05 국토교통부 기준</p>
        </>
      )}
    </div>
  );
};

export default SidebarDetail;

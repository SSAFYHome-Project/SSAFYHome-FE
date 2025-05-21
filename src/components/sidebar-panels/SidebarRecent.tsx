import { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/SidebarPanel.css";

import closeIcon from "../../assets/img/close.png";

interface DealInfo {
  dealId?: number;
  aptName: string;
  dealType: "RENT" | "TRADE";
  regionCode: string;
  jibun: string;
  deposit: number;
  monthlyRent: number;
  dealAmount: number;
  excluUseAr: number;
  dealYear: number;
  dealMonth: number;
  dealDay: number;
  floor: number;
  buildYear: number;
}

const SidebarRecent = () => {
  const [recentDeals, setRecentDeals] = useState<DealInfo[]>([]);

  useEffect(() => {
    const getRecents = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        const response = await axios.get("/api/user/recentView", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRecentDeals(response.data || []);
      } catch (error) {
        console.error("최근 본 매물 목록을 불러오지 못했습니다.", error);
      }
    };

    getRecents();
  }, []);

  const getFormattedLabel = (item: DealInfo): string => {
    const formatDeposit = (num: number) => {
      const converted = num / 10;
      if (converted < 1) {
        return Math.round(converted * 10000).toLocaleString() + "만원";
      }
      return converted.toFixed(1).replace(/\.0$/, "") + "억";
    };

    const formatDealAmount = (num: number) => {
      const converted = num / 10;
      if (converted < 1) {
        return Math.round(converted * 10000).toLocaleString() + "만원";
      }
      return converted.toFixed(1).replace(/\.0$/, "") + "억";
    };

    const deposit = item.deposit || 0;
    const rent = item.monthlyRent || 0;
    const dealAmount = item.dealAmount || 0;

    if (item.dealType === "TRADE") {
      return `실거래가: ${formatDealAmount(dealAmount)}`;
    } else {
      return rent === 0
        ? `전세가: ${formatDeposit(deposit)}`
        : `보증금: ${formatDeposit(deposit)} / 월세: ${rent.toLocaleString()}만원`;
    }
  };

  const getSubInfo = (item: DealInfo): string => {
    const m2 = item.excluUseAr?.toFixed(1) ?? "-";
    const pyeong = item.excluUseAr ? `${Math.round(item.excluUseAr * 0.3025)}평` : "-평";
    const floor = item.floor ?? "-";
    return `${m2}㎡ · ${pyeong} / ${floor}층`;
  };

  const areDealsEqual = (a: DealInfo, b: DealInfo) => {
    return (
      a.aptName === b.aptName &&
      a.dealYear === b.dealYear &&
      a.dealMonth === b.dealMonth &&
      a.dealDay === b.dealDay &&
      a.excluUseAr === b.excluUseAr &&
      a.floor === b.floor
    );
  };

  const handleDelete = async (deal: DealInfo) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      await axios.delete("/api/user/recentView", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: deal,
      });

      setRecentDeals((prev) =>
        prev.filter((item) => {
          if (deal.dealId) {
            return item.dealId !== deal.dealId;
          } else {
            return !areDealsEqual(item, deal);
          }
        })
      );
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <h2>최근 본 매물</h2>
      </div>
      <div className="panel-header-subtitle">
        <p>
          내가 최근 본 매물을 확인해보세요. <br />
          최근 본 매물 삭제가 가능합니다.
        </p>
      </div>

      <div className="recent-card-container">
        {recentDeals.length === 0 ? (
          <p className="empty-text">최근 본 매물이 없습니다.</p>
        ) : (
          recentDeals.map((item) => (
            <div
              className="recent-card"
              key={
                item.dealId ?? `${item.aptName}-${item.dealYear}-${item.dealMonth}-${item.dealDay}-${item.excluUseAr}`
              }
            >
              <div className="recent-card-body">
                <button className="recent-close-btn" onClick={() => handleDelete(item)} aria-label="최근 매물 삭제">
                  <img src={closeIcon} alt="삭제" className="close-icon" />
                </button>
                <div>
                  <h3 className="recent-title">{item.aptName}</h3>
                  <div className="recent-info">
                    <p className="recent-address">{item.regionCode}</p>
                    <p className="recent-address">{getSubInfo(item)}</p>
                  </div>
                </div>
              </div>
              <div className="recent-price">
                <span>{getFormattedLabel(item)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SidebarRecent;

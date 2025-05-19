import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/SidebarPanel.css";

import heartIcon from "../../assets/img/heart-filled.png";
import heartHoverIcon from "../../assets/img/heart.png";

interface BookmarkResponse {
  bookmarkIdx: number;
  user: any; // 생략 가능, 현재는 사용하지 않음
  deal: DealInfo;
  reg_date: string;
}

interface DealInfo {
  dealId: number;
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

const SidebarFavorite = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<BookmarkResponse[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get("/api/user/bookmark", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFavorites(response.data);
      } catch (error) {
        console.error("관심 매물 목록을 불러오지 못했습니다.", error);
      }
    };
    fetchFavorites();
  }, []);

  const handleDelete = async (bookmarkIdx: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`/api/user/bookmark/${bookmarkIdx}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFavorites((prev) => prev.filter((f) => f.bookmarkIdx !== bookmarkIdx));
      alert("삭제되었습니다.");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const getFormattedLabel = (deal: DealInfo): string => {
    const formatNumber = (num: number) => {
      return num >= 10000 ? (num / 10000).toFixed(2).replace(/\.?0+$/, "") + "억" : num.toLocaleString() + "만원";
    };

    if (deal.dealType === "RENT") {
      if (deal.monthlyRent > 0) {
        return `보증금: ${formatNumber(deal.deposit)} / 월세: ${deal.monthlyRent.toLocaleString()}만원`;
      } else {
        return `전세가: ${formatNumber(deal.deposit)}`;
      }
    } else {
      return `실거래가: ${formatNumber(deal.dealAmount)}`;
    }
  };

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <h2>관심 매물 확인</h2>
      </div>
      <div className="panel-header-subtitle">
        <p>
          내 관심 매물을 관리해보세요. <br />
          관심 매물 추가 / 삭제가 가능합니다.
        </p>
      </div>
      {favorites.length === 0 ? (
        <p className="empty-text">관심 매물이 없습니다.</p>
      ) : (
        favorites.map(({ bookmarkIdx, deal }) => (
          <div className="favorite-card" key={bookmarkIdx}>
            <div className="favorite-card-body">
              <div>
                <h3 className="favorite-title">{deal.aptName}</h3>
                <p className="favorite-address">{deal.regionCode}</p>
              </div>
              <div
                className="favorite-delete-group"
                onMouseEnter={() => setHoveredIdx(bookmarkIdx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => handleDelete(bookmarkIdx)}
              >
                <img
                  src={hoveredIdx === bookmarkIdx ? heartHoverIcon : heartIcon}
                  alt="삭제하기"
                  className="heart-img"
                />
                <span className={`favorite-text ${hoveredIdx === bookmarkIdx ? "hover" : ""}`}>삭제하기</span>
              </div>
            </div>
            <div className="favorite-price">
              <span>{getFormattedLabel(deal)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SidebarFavorite;

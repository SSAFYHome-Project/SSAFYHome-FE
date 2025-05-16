import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/SidebarPanel.css";

import heartFilledIcon from "../../assets/img/heart-filled.png";
import heartHoverIcon from "../../assets/img/heart.png";

interface FavoriteItem {
  bookmarkIdx: number;
  aptNm: string;
  estateAgentAggNm: string;
  umdNm: string;
  dealAmount: number;
  createdAt: string;
}

const SidebarFavorite = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const data = await fetchFavorites();
      setFavorites(data);
    };
    loadFavorites();
  }, []);

  const fetchFavorites = async (): Promise<FavoriteItem[]> => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get("/api/user/bookmark", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.map((item: any) => ({
        bookmarkIdx: item.bookmarkIdx,
        aptNm: item.aptNm,
        estateAgentAggNm: item.estateAgentAggNm,
        umdNm: item.umdNm,
        dealAmount: item.dealAmount,
        createdAt: item.createdAt,
      }));
    } catch (error) {
      console.error("관심 매물 목록을 불러오지 못했습니다.", error);
      return [];
    }
  };

  const formatDealAmount = (amount: number) => {
    const total = amount * 10000;
    const eok = Math.floor(total / 100000000);
    const man = Math.floor((total % 100000000) / 10000);
    return man === 0 ? `${eok}억` : `${eok}억 ${man.toLocaleString()}만원`;
  };

  const handleDelete = (bookmarkIdx: number) => {
    alert(`삭제 요청: bookmarkIdx=${bookmarkIdx}`);
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
        favorites.map((item) => (
          <div className="favorite-card" key={item.bookmarkIdx}>
            <div className="favorite-card-body">
              <div>
                {favorites.map((item) => (
                  <div key={item.bookmarkIdx}>
                    <h3 className="favorite-title">{item.aptNm}</h3>
                    <p className="favorite-address">서울특별시 {item.umdNm}</p>
                  </div>
                ))}
              </div>
              <div
                className="favorite-delete-group"
                onMouseEnter={() => setHoveredIdx(item.bookmarkIdx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <img
                  src={hoveredIdx === item.bookmarkIdx ? heartHoverIcon : heartFilledIcon}
                  alt="하트"
                  className="heart-icon"
                />
                <button
                  className={`favorite-delete-btn ${hoveredIdx === item.bookmarkIdx ? "hover" : ""}`}
                  onClick={() => handleDelete(item.bookmarkIdx)}
                >
                  삭제하기
                </button>
              </div>
            </div>

            <div className="favorite-price">
              <span>{formatDealAmount(item.dealAmount)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SidebarFavorite;

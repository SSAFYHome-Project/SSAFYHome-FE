import { useState } from "react";
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

  const favorites: FavoriteItem[] = [
    {
      bookmarkIdx: 1,
      aptNm: "롯데캐슬프레미어",
      estateAgentAggNm: "부동산하트",
      umdNm: "강남구 삼성동 11",
      dealAmount: 37200,
      createdAt: "2025-05-09T04:59:00.130+00:00",
    },
    {
      bookmarkIdx: 2,
      aptNm: "래미안퍼스티지",
      estateAgentAggNm: "해피공인중개사",
      umdNm: "강남구 도곡동 88",
      dealAmount: 39800,
      createdAt: "2025-05-08T11:15:00.000+00:00",
    },
  ];

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
                <h3 className="favorite-title">{item.aptNm}</h3>
                <p className="favorite-address">서울특별시 {item.umdNm}</p>
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

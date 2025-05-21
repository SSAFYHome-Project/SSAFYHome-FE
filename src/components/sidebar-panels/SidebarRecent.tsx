import { useState } from "react";

import closeIcon from "../../assets/img/close.png";

import "../../styles/SidebarPanel.css";

interface RecentItem {
  id: number;
  aptNm: string;
  umdNm: string;
  dealAmount: number;
}

const SidebarRecent = () => {
  const [recentList, setRecentList] = useState<RecentItem[]>([
    {
      id: 1,
      aptNm: "롯데캐슬프레미어",
      umdNm: "강남구 삼성동 11",
      dealAmount: 37200,
    },
    {
      id: 2,
      aptNm: "래미안퍼스티지",
      umdNm: "강남구 도곡동 88",
      dealAmount: 39800,
    },
  ]);

  const formatDealAmount = (amount: number) => {
    const total = amount * 10000;
    const eok = Math.floor(total / 100000000);
    const man = Math.floor((total % 100000000) / 10000);
    return man === 0 ? `${eok}억` : `${eok}억 ${man.toLocaleString()}만원`;
  };

  const handleDelete = (id: number) => {
    setRecentList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <h2>최근 본 매물</h2>
      </div>
      <div className="panel-header-subtitle">
        <p>
          최근 본 매물을 확인해보세요. <br />
          최근 본 매물 삭제가 가능합니다.
        </p>
      </div>
      <div className="recent-card-container">
        {recentList.length === 0 ? (
          <p className="empty-text">최근 본 매물이 없습니다.</p>
        ) : (
          recentList.map((item) => (
            <div className="recent-card" key={item.id}>
              <button className="recent-close-btn" onClick={() => handleDelete(item.id)} aria-label="최근 매물 삭제">
                <img src={closeIcon} alt="삭제" className="close-icon" />
              </button>

              <div>
                <div className="recent-card-title">{item.aptNm}</div>
                <div className="recent-card-address">서울특별시 {item.umdNm}</div>
              </div>

              <div className="recent-card-price">{formatDealAmount(item.dealAmount)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SidebarRecent;

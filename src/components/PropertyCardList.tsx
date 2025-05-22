import { MouseEvent, useState, useEffect } from "react";
import axios from "axios";
import "../styles/PropertyCardList.css";

import heartIcon from "../assets/img/heart-filled.png";
import heartHoverIcon from "../assets/img/heart.png";

type DealItem = {
  sido: string;
  gugun: string;
  dong: string;
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
  dealMonth?: number | string;
  dealDay?: number | string;
};

type Props = {
  title: string;
  items: DealItem[];
  onSelect: (item: DealItem) => void;
};

const PropertyCardList = ({ title, items, onSelect }: Props) => {
  const [visibleCount, setVisibleCount] = useState(20);
  const visibleItems = items.slice(0, visibleCount);
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleClick = (e: MouseEvent, item: DealItem) => {
    e.preventDefault();
    onSelect(item);
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 20);
  };

  const getFormattedLabel = (item: DealItem): string => {
    const formatNumber = (num: number) => {
      return num >= 10000 ? (num / 10000).toFixed(2).replace(/\.?0+$/, "") + "억" : num.toLocaleString() + "만원";
    };

    if (item.dealAmount) {
      const deal = parseInt(item.dealAmount.replace(/,/g, ""));
      return `실거래가: ${formatNumber(deal)}`;
    } else {
      const deposit = parseInt(String(item.deposit ?? "0").replace(/,/g, ""));
      const rent = parseInt(String(item.monthlyRent ?? "0").replace(/,/g, ""));
      return rent === 0
        ? `전세가: ${formatNumber(deposit)}`
        : `보증금: ${formatNumber(deposit)} / 월세: ${rent.toLocaleString()}만원`;
    }
  };

  const getSubInfo = (item: DealItem): string => {
    const areaNum = parseFloat(item.area || "0");
    const m2 = isNaN(areaNum) ? "-" : areaNum.toFixed(1);
    const pyeong = isNaN(areaNum) ? "-평" : `${Math.round(areaNum * 0.3025)}평`;
    const floor = item.floor ?? "-";
    return `${m2}㎡ · ${pyeong} / ${floor}층`;
  };

  const getFormattedDate = (item: DealItem): string => {
    const month = String(item.dealMonth ?? "-").replace(/^0/, "");
    const day = String(item.dealDay ?? "-").replace(/^0/, "");
    return `📅 ${month}월 ${day}일`;
  };

  useEffect(() => {
    const getFavorites = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const response = await axios.get("/api/user/bookmark", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const favoriteNames = response.data.map((fav: any) => fav.deal.aptName);
        setFavorites(favoriteNames);
      } catch (error) {
        console.error("관심 매물 목록을 불러오지 못했습니다.", error);
      }
    };

    getFavorites();
  }, []);

  return (
    <div className="property-card-list">
      <div className="card-container">
        {visibleItems.length === 0 ? (
          <p className="no-data">매물이 없습니다.</p>
        ) : (
          visibleItems.map((item, index) => {
            const isFavorite = favorites.some((favName) => item.aptName.includes(favName));
            return (
              <div key={index} className="property-card" onClick={(e) => handleClick(e, item)}>
                <img
                  className="heart-icon"
                  src={isFavorite ? heartIcon : heartHoverIcon}
                  alt="하트"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
                <div className="card-header">
                  <h4>{item.aptName}</h4>
                </div>
                <div className="card-body">
                  <p className="address">
                    {item.sido} {item.gugun} {item.dong} {item.jibun}
                  </p>
                  <p className="info">{getSubInfo(item)}</p>
                  <p className="deal-amount">{getFormattedLabel(item)}</p>
                  <p className="deal-date">{getFormattedDate(item)}</p>
                </div>
                <div className="card-footer">
                  <button
                    className="card-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      const query = encodeURIComponent(`${item.umdNm} ${item.aptName}`);
                      window.open(`https://m.land.naver.com/search/result/${query}`, "_blank");
                    }}
                  >
                    <span className="naver-icon">N</span> 매물 보기
                  </button>
                  <button
                    className="card-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      const fullAddress = `${item.sido} ${item.gugun} ${item.dong} ${item.jibun} ${item.aptName}`;
                      const encoded = encodeURIComponent(fullAddress);
                      window.open(`https://map.naver.com/v5/search/${encoded}`, "_blank");
                    }}
                  >
                    <span className="naver-icon">N</span> 로드뷰 보기
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {visibleCount < items.length && (
        <div className="show-more-container">
          <button className="show-more-button" onClick={handleShowMore}>
            더보기 +
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyCardList;

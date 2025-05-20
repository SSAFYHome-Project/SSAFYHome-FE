import { MouseEvent, useState } from "react";
import "../styles/PropertyCardList.css";

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

type Props = {
  title: string;
  items: DealItem[];
  onSelect: (item: DealItem) => void;
};

const PropertyCardList = ({ title, items, onSelect }: Props) => {
  const [visibleCount, setVisibleCount] = useState(20); // 처음에 20개 보임
  const visibleItems = items.slice(0, visibleCount);

  const handleClick = (e: MouseEvent, item: DealItem) => {
    e.preventDefault();
    onSelect(item);
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 20); // 클릭 시 20개 추가
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

  return (
    <div className="property-card-list">
      <div className="card-container">
        {visibleItems.length === 0 ? (
          <p className="no-data">매물이 없습니다.</p>
        ) : (
          visibleItems.map((item, index) => (
            <div key={index} className="property-card" onClick={(e) => handleClick(e, item)}>
              <div className="card-header">
                <h4>{item.aptName}</h4>
              </div>
              <div className="card-body">
                <p className="info">{getSubInfo(item)}</p>
                <p className="deal-amount">{getFormattedLabel(item)}</p>
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
              </div>
            </div>
          ))
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

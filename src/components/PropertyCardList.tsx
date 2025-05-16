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
};

type Props = {
  title: string;
  items: DealItem[];
  onSelect: (item: DealItem) => void;
};

const PropertyCardList = ({ title, items, onSelect }: Props) => {
  const handleClick = (e: MouseEvent, item: DealItem) => {
    e.preventDefault();
    onSelect(item);
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

      if (rent === 0) {
        return `전세가: ${formatNumber(deposit)}`;
      } else {
        return `보증금: ${formatNumber(deposit)} / 월세: ${rent.toLocaleString()}만원`;
      }
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 850, behavior: "smooth" });
  };

  return (
    <div className="property-card-list">
      <div className="card-container">
        {currentItems.length === 0 ? (
          <p className="no-data">매물이 없습니다.</p>
        ) : (
          currentItems.map((item, index) => (
            <div key={index} className="property-card" onClick={(e) => handleClick(e, item)}>
              <div className="card-header">
                <h4>{item.aptName}</h4>
              </div>
              <div className="card-body">
                <p className="deal-amount">{getFormattedLabel(item)}</p>
                <p className="info">
                  {item.area}㎡ / {item.floor}층
                </p>
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

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={page === currentPage ? "active-page" : ""}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyCardList;

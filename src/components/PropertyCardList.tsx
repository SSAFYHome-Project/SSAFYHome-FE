import { MouseEvent } from "react";
import "../styles/PropertyCardList.css";

type DealItem = {
  aptName: string;
  dealAmount: string;
  buildYear: string;
  area: string;
  floor: string;
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

  return (
    <div className="property-card-list">
      <h3>{title}</h3>
      <div className="card-container">
        {items.length === 0 ? (
          <p className="no-data">매물이 없습니다.</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="property-card" onClick={(e) => handleClick(e, item)}>
              <h4>{item.aptName}</h4>
              <p className="deal-amount">{item.dealAmount}만원</p>
              <p>
                {item.area}㎡ / {item.floor}층
              </p>
              <p>{item.buildYear}년 건축</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PropertyCardList;

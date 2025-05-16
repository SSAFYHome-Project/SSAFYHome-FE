import "../../styles/SideBarPanel.css";

import memo from "../../assets/img/memo.png";

interface SidebarEmptyProps {
  onCloseSidebar: () => void;
}

const SidebarEmpty = ({ onCloseSidebar }: SidebarEmptyProps) => {
  return (
    <div className="sidebar-panel sidebar-block">
      <div className="sidebar-block-content">
        <img src={memo} alt="검색 안내" className="login-icon" />
        <h2 className="login-title">
          상세 정보 확인은
          <br />
          검색 후 이용 가능합니다.
        </h2>
        <p className="login-subtext">
          지도에서 검색하고,
          <br />
          매물 카드를 클릭하면 상세 정보를 볼 수 있어요!
        </p>
        <button className="skip-btn" onClick={onCloseSidebar}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default SidebarEmpty;

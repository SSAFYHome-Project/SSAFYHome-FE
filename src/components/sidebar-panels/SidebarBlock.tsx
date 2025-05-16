import { useNavigate } from "react-router-dom";
import "../../styles/SideBarPanel.css";

import user from "../../assets/img/user.png";

interface SidebarBlockProps {
  message: string;
  onCloseSidebar: () => void;
}

const SidebarBlock = ({ onCloseSidebar, message }: SidebarBlockProps) => {
  const navigate = useNavigate();

  return (
    <div className="sidebar-panel sidebar-block">
      <div className="sidebar-block-content">
        <img src={user} alt="로그인 필요" className="login-icon" />
        <h2 className="login-title">
          {message}
          <br />
          로그인 후 이용 가능합니다.
        </h2>
        <p className="login-subtext">
          관심 아파트와 최근 본 매물을
          <br />
          로그인 후 한눈에 확인해보세요!
        </p>

        <button className="sidebar-login-btn" onClick={() => navigate("/login")}>
          로그인 하기
        </button>
        <button className="skip-btn" onClick={onCloseSidebar}>
          나중에 하기
        </button>
      </div>
    </div>
  );
};

export default SidebarBlock;

import "../styles/AISummaryButton.css";
import aiIcon from "../assets/img/ai_icon.png";

interface Props {
  isVisible: boolean;
  onClick: () => void;
}

const AISummaryButton = ({ isVisible, onClick }: Props) => {
  if (!isVisible) return null;

  return (
    <button className="ai-summary-button" onClick={onClick}>
      <img src={aiIcon} alt="AI 요약 아이콘" className="ai-icon" />
      <div className="ai-text">
        <div>AI 요약</div>
        <div>생성 요청</div>
      </div>
    </button>
  );
};

export default AISummaryButton;

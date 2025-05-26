import { useEffect, useState } from "react";
import axios from "axios";
import { marked } from "marked";
import { FiRefreshCw, FiCopy } from "react-icons/fi";
import "../styles/AISummary.css";

type Props = {
  sido: string;
  gigun: string;
  umd: string;
  onClose: () => void;
};

marked.setOptions({
  breaks: true,
});

const AISummary = ({ sido, gigun, umd, onClose }: Props) => {
  const [summaryText, setSummaryText] = useState("요약을 불러오는 중입니다...");
  const [toastVisible, setToastVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/map/summary", {
        sido,
        gigun,
        umd,
      });

      const rawSummary = response.data.summary || "요약 결과가 없습니다.";
      console.log(rawSummary);
      const htmlSummary = marked(rawSummary);
      console.log(htmlSummary);
      setSummaryText(htmlSummary);
    } catch (error) {
      console.error(error);
      setSummaryText("요약을 불러오는데 실패했어요 😢");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [sido, gigun, umd]);

  const handleCopy = () => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = summaryText;
    const plainText = tempDiv.innerText;
    navigator.clipboard.writeText(plainText);

    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  return (
    <div className="aisummary-overlay">
      <div className="aisummary-modal">
        <h2 className="modal-title">AI 요약 생성</h2>
        <p className="modal-subtitle">
          내가 찾은{" "}
          <strong>
            {sido} {gigun} {umd}
          </strong>{" "}
          요약으로 빠르게 확인하세요!
        </p>

        <div className="summary-box">
          {isLoading ? (
            <p className="loading-text">
              AI 요약 생성 중 입니다
              <span className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </p>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: summaryText }} />
          )}
        </div>

        <div className="modal-actions">
          <button className="modal-action-link" onClick={fetchSummary}>
            <FiRefreshCw style={{ marginRight: "6px" }} />
            다시 생성하기
          </button>

          <div className="modal-action-group">
            <button onClick={handleCopy} className="modal-button">
              <FiCopy style={{ marginRight: "6px" }} />
              복사하기
            </button>
          </div>

          {toastVisible && <div className="toast-message">클립보드에 복사 되었습니다!</div>}
        </div>

        <button onClick={onClose} className="modal-close">
          ✕
        </button>
      </div>
    </div>
  );
};

export default AISummary;

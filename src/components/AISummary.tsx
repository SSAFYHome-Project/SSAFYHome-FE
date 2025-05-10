import { useState } from "react";
import "../styles/AISummaryModal.css";

const AISummary = ({ summaryText, onClose }: { summaryText: string; onClose: () => void }) => {
  return (
    <div className="aisummary-overlay">
      <div className="aisummary-modal">
        <h2 className="modal-title">AI 요약 생성</h2>
        <p className="modal-subtitle">내가 찾은 지역, 요약으로 빠르게 확인하세요!</p>

        <div className="summary-box">
          {summaryText}
        </div>

        <div className="modal-actions">
          <button
            className="modal-action-link"
            onClick={() => alert("다시 생성 기능은 추후 구현 예정입니다.")}
          >
            다시 생성하기
          </button>

          <div className="modal-action-group">
            <button
              onClick={() => navigator.clipboard.writeText(summaryText)}
              className="modal-button"
            >
              복사하기
            </button>

            <button
              onClick={() => alert("공유 기능은 추후 구현 예정입니다.")}
              className="modal-button"
            >
              공유하기
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="modal-close"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AISummary;

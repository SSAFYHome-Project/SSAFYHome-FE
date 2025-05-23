import { useState } from "react";
import warningIcon from "../assets/img/icon_warning.png";
import smileIcon from "../assets/img/face_smile.png";
import neutralIcon from "../assets/img/face_neutral.png";
import sadIcon from "../assets/img/face_sad.png";
import "../styles/SafeyGrade.css";

const SafetyGrade = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="safety-icon-fixed" onClick={() => setIsOpen(true)}>
        <img src={warningIcon} alt="안전등급 안내" />
      </div>

      {isOpen && (
        <div className="safety-overlay" onClick={() => setIsOpen(false)}>
          <div className="safety-modal" onClick={(e) => e.stopPropagation()}>
            <h3>안전등급 안내</h3>
            <p>
              안전등급은 행정안전부가 제공하는 지표로, <br></br>
              최근 1년간의 강도, 성폭력, 폭력, 절도, 살인 등 5대 범죄 발생 현황을 <br></br>
              분석하여 행정구역별 범죄 위험도를 수치화한 정보입니다.
            </p>
            <ul className="safety-list">
              <li>
                <img src={smileIcon} alt="선호" />
                <div className="safety-list-content">
                  <span>선호</span>
                  <p>범죄 발생이 적은 지역으로, 비교적 안심하고 거주할 수 있는 곳입니다.</p>
                </div>
              </li>
              <li>
                <img src={neutralIcon} alt="양호" />
                <div className="safety-list-content">
                  <span>양호</span>
                  <p>범죄 발생이 보통 수준이며, 생활 시 일정 수준의 주의가 필요한 지역입니다.</p>
                </div>
              </li>
              <li>
                <img src={sadIcon} alt="주의" />
                <div className="safety-list-content">
                  <span>위험</span>
                  <p>범죄 발생이 많은 지역으로, 특히 주의가 필요한 지역입니다.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default SafetyGrade;

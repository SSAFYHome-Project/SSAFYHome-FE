import { useEffect, useState } from "react";
import axios from "axios";

import neutralIcon from "../assets/img/face_neutral.png";
import sadIcon from "../assets/img/face_sad.png";
import smileIcon from "../assets/img/face_smile.png";
import "../styles/SafeGrade.css";

interface SafeGradeProps {
  isVisible: boolean;
  selectedRegion?: { sido: string; gugun: string };
}

interface SafeData {
  sido: string;
  sigungu: string;
  totalIndex: number;
  grade: number;
  status: string;
  trafficRisk: number;
  fireRisk: number;
  suicideRisk: number;
  diseaseRisk: number;
  crimeRisk: number;
  lifeRisk: number;
}

const SafeGrade = ({ isVisible, selectedRegion }: SafeGradeProps) => {
  const [data, setData] = useState<SafeData | null>(null);

  useEffect(() => {
    if (!isVisible || !selectedRegion) return;

    const fetchSafetyGrade = async () => {
      try {
        const res = await axios.get("/api/map/safety", {
          params: {
            sido: selectedRegion.sido,
            sigungu: selectedRegion.gugun,
          },
        });
        setData(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("안전 등급 조회 실패:", error);
        setData(null);
      }
    };

    fetchSafetyGrade();
  }, [isVisible, selectedRegion]);

  if (!isVisible || !data) return null;

  const getImageIcon = (status: string) => {
    switch (status) {
      case "안전":
        return smileIcon;
      case "보통":
        return neutralIcon;
      case "위험":
        return sadIcon;
      default:
        return neutralIcon;
    }
  };

  return (
    <div className="safety-box">
      <img src={getImageIcon(data.status)} alt={data.status} className="safety-icon" />
      <div className="safety-text">
        <div>안전등급</div>
        <div>{data.status}</div>
      </div>
      <div className="tooltip-box">
        <div className="bar-list">
          {[
            { label: "교통사고", value: data.trafficRisk },
            { label: "화재", value: data.fireRisk },
            { label: "질병", value: data.diseaseRisk },
            { label: "범죄", value: data.crimeRisk },
            { label: "생활안전", value: data.lifeRisk },
          ].map((item) => (
            <div key={item.label} className="bar-item">
              <span className="bar-label">{item.label}</span>
              <div className="bar">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(item.value / 5) * 100}%`,
                    backgroundColor: item.value >= 4 ? "#ff5b5b" : item.value >= 3 ? "#ffc107" : "#4caf50",
                  }}
                />
              </div>
              <span className="bar-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafeGrade;

import { useState } from "react";
import "../styles/Community.css"; // 또는 FortuneBox.css

const fortunes = [
  "💰 예상치 못한 돈이 들어올 수 있어요!",
  "📉 무리한 투자는 피하세요!",
  "🎁 뜻밖의 선물을 받을 수도 있어요.",
  "💳 오늘은 신용 거래에 유리한 날입니다.",
  "🧾 지출 관리에 집중하면 행운이 따라요.",
];

export default function FortuneBox() {
  const [revealed, setRevealed] = useState(false);
  const [fortune, setFortune] = useState("");

  const revealFortune = () => {
    if (!revealed) {
      const random = fortunes[Math.floor(Math.random() * fortunes.length)];
      setFortune(random);
      setRevealed(true);
    }
  };

  return (
    <div className={`fortune-box ${revealed ? "revealed" : ""}`} onClick={revealFortune}>
      {revealed ? fortune : "💫 오늘의 금전운을 뽑아보세요"}
    </div>
  );
}

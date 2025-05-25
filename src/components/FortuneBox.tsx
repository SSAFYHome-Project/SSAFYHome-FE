import { useState } from "react";
import confetti from "canvas-confetti";
import "../styles/Community.css"; 

const fortunes = [
  "💰 오늘은 자산을 지키는 데 집중하면 좋은 날입니다.",
  "🏡 익숙한 동네에서 예상보다 괜찮은 매물을 발견할 수 있어요.",
  "🔍 작은 정보 하나가 큰 지출을 막아줄 수 있어요.",
  "📉 지금은 서두르기보다 비교하고 기다리는 게 현명합니다.",
  "🧾 지출을 돌아보면 불필요한 구독이나 낭비가 보일 수 있어요.",
  "💳 할부보단 계획된 지출이 오늘의 운을 지켜줍니다.",
  "📍 오늘은 위치와 주변 환경을 꼼꼼히 살펴보세요.",
  "📄 계약 관련 서류를 다시 한 번 점검해보면 좋습니다.",
  "🪙 지금 쓰는 돈보다 다음 달을 위한 준비가 필요한 날이에요.",
  "👀 지나치기 쉬운 조건 속에 핵심 정보가 숨어 있을 수 있어요.",
  "💬 주변 조언보다 내 판단을 믿어야 할 때입니다.",
  "🏦 대출 조건을 비교해보면 생각보다 유리한 조건이 있을 수 있어요.",
  "📦 오늘은 새로운 집보다는 현재 환경을 정비하는 데 운이 있습니다.",
  "📲 앱 알림을 주의 깊게 보면 괜찮은 매물을 마주칠 수 있어요.",
  "📈 부동산 시장 흐름보다는 내 상황에 맞는 선택이 중요해요.",
  "🚪 오늘은 집 안 정리를 하면 금전운이 들어올 수 있어요.",
  "💡 계약 전 마지막 확인, 오늘만큼은 꼭 놓치지 마세요.",
  "🧭 내가 아는 지역이 가장 안전할 수 있습니다.",
  "🧾 오늘은 실거주 기준으로 판단하면 후회가 없습니다.",
  "🗓️ 조급한 결정은 피하고, 여유를 갖는 게 행운을 부릅니다.",
  "📬 뜻밖의 연락이 좋은 소식으로 이어질 수 있어요.",
  "💼 오늘은 부동산 관련 공부나 정보 수집에 좋은 날입니다.",
  "👣 발품을 팔면 그만큼 결과로 돌아오는 운세입니다.",
  "📑 꼼꼼히 따지는 하루가 장기적으로 큰 돈을 지켜줄 수 있어요.",
  "🔑 오늘은 ‘안정성’이라는 키워드에 집중하세요.",
  "👛 작은 절약이 큰 만족으로 이어지는 날입니다.",
  "📉 계약서의 작은 글씨 안에 중요한 조건이 숨어 있을 수 있어요.",
  "🏠 오늘은 나에게 맞는 집의 기준을 다시 정리해보면 좋습니다.",
  "💬 커뮤니티 속 경험담에서 유용한 정보가 나올 수 있어요.",
  "🌕 오늘의 운은 '신중함'에 달려 있습니다."
];

export default function FortuneBox() {
  const [revealed, setRevealed] = useState(false);
  const [fortune, setFortune] = useState("");

  const revealFortune = () => {
    if (!revealed) {
      const random = fortunes[Math.floor(Math.random() * fortunes.length)];
      setFortune(random);
      setRevealed(true);

      confetti({
        particleCount: 100,
        spread: 80,
        startVelocity: 35,
        origin: { x: 0.65, y: 0.95 },
        zIndex: 1000,
      });
        }
      };

  return (
    <div className={`fortune-box ${revealed ? "revealed" : ""}`} onClick={revealFortune}>
      {revealed ? fortune : "💫 오늘의 금전운을 뽑아보세요"}

      {revealed && <div className="petal-effect" />}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import axios from "axios";
import "../../styles/SidebarCustom.css";
import logoImg from "../../assets/img/chatbot-logo.png";

const SidebarCustom = () => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: `${localStorage.getItem("userName")}님, 안녕하세요 👋\n\n${
        localStorage.getItem("userAddress")
          ? `현재 설정된 주소는 '${localStorage.getItem(
              "userAddress"
            )}'입니다. 해당 지역을 기준으로 동네를 추천드릴게요!\n\n`
          : ""
      }궁금하신 조건을 입력하시거나 아래 버튼을 눌러 시작해 주세요.`,
      isMarkdown: true,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [userAnswers, setUserAnswers] = useState<any>({});

  const questions = [
    "희망하시는 지역을 입력해 주세요 (예: 서울 강남구)",
    "거래 유형을 선택해주세요",
    "희망 가격대를 선택해주세요",
    "원하는 평수를 선택해주세요",
    "가족 구성은 어떻게 되시나요?",
    "자녀가 있다면 나이를 알려주세요.",
    "주로 이용하시는 교통수단은 무엇인가요?",
    "야간에 귀가하시는 경우가 많으신가요?",
    "선호하시는 동네 분위기를 알려주세요.",
  ];

  const staticOptions: { [key: number]: string[] } = {
    1: ["매매", "전세", "월세"],
    3: ["10~20평", "20~30평", "30~40평", "40평 이상"],
    4: ["혼자", "부부", "아이와 함께"],
    5: ["미취학", "초등학생", "중학생", "고등학생"],
    6: ["지하철", "버스", "자차"],
    7: ["있다", "가끔 있다", "없다"],
  };

  const getBudgetOptions = (type: string) => {
    switch (type) {
      case "매매":
        return ["2~4억", "4~6억", "6~8억", "8억 이상"];
      case "전세":
        return ["1~2억", "2~4억", "4~6억", "6억 이상"];
      case "월세":
        return ["500/40", "1000/50", "3000/60", "5000/70"];
      default:
        return [];
    }
  };

  const currentOptions =
    questionIndex === 2
      ? getBudgetOptions(userAnswers.transactionType).map((v) => ({ text: v, value: v }))
      : staticOptions[questionIndex]?.map((v) => ({ text: v, value: v }));

  const handleStart = () => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { from: "bot", text: questions[0], time }]);
    setQuestionIndex(0);
  };

  const handleAnswer = async (value: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { from: "user", text: value, time }]);

    const updatedAnswers = { ...userAnswers };
    switch (questionIndex) {
      case 0:
        updatedAnswers.region = value;
        break;
      case 1:
        updatedAnswers.transactionType = value;
        break;
      case 2:
        updatedAnswers.priceRange = value;
        break;
      case 3:
        updatedAnswers.areaSize = value;
        break;
      case 4:
        updatedAnswers.familyType = value;
        break;
      case 5:
        updatedAnswers.childrenAge = value;
        break;
      case 6:
        updatedAnswers.transport = value;
        break;
      case 7:
        updatedAnswers.nightReturn = value;
        break;
      case 8:
        updatedAnswers.mood = value;
        break;
    }
    setUserAnswers(updatedAnswers);
    console.log(updatedAnswers);

    let nextIndex = questionIndex + 1;

    if (questionIndex === 4 && value !== "아이와 함께") {
      updatedAnswers.childrenAge = null;
      nextIndex = 6;
    }

    if (nextIndex >= questions.length) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        console.log(token);
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        const res = await axios.post("/api/chatbot/recommendation", updatedAnswers, config);
        console.log("Response:", res);
        // const recommend = res.data.recommend || res.data;

        const markdown = res.data.recommend || res.data;
        const html = marked.parse(markdown);
        setMessages((prev) => [...prev, { from: "bot", text: html, isMarkdown: true, time }]);

        // setMessages((prev) => [...prev, { from: "bot", text: recommend, time }]);
      } catch {
        setMessages((prev) => [...prev, { from: "bot", text: "추천 요청 중 오류가 발생했어요 😢", time }]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setTimeout(() => {
        setMessages((prev) => [...prev, { from: "bot", text: questions[nextIndex], time }]);
        setQuestionIndex(nextIndex);
      }, 400);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    handleAnswer(input.trim());
    setInput("");
  };

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="sidebar-panel">
      <div className="chatbot-header-box">
        <div className="chatbot-header">
          <img src={logoImg} alt="로고" className="chatbot-icon" />
          <div className="chatbot-title">
            <h1>지도 밖은 위험해 상담봇</h1>
            <p>안전한 지역의 맞춤형 매물만 추천해드립니다. 🏠</p>
          </div>
        </div>
      </div>

      <div className="chat-window">
        <div className="chat-date-label">{new Date().toLocaleDateString("ko-KR")}</div>

        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.from}`}>
            {msg.isMarkdown ? (
              <div className="bubble markdown" dangerouslySetInnerHTML={{ __html: msg.text }} />
            ) : (
              <div className="bubble">{msg.text}</div>
            )}
            <div className="bubble-time">{msg.time}</div>
          </div>
        ))}

        {questionIndex === -1 && (
          <div className="chat-bubble bot">
            <div className="bubble button-bubble">
              <div className="suggested-buttons">
                <button className="option-btn" onClick={handleStart}>
                  🎯 맞춤형 매물 추천 받기
                </button>
              </div>
            </div>
          </div>
        )}

        {questionIndex !== -1 && currentOptions && (
          <div className="chat-bubble bot">
            <div className="bubble button-bubble">
              <div className="suggested-buttons">
                {currentOptions.map((btn, i) => (
                  <button key={i} className="option-btn" onClick={() => handleAnswer(btn.value)}>
                    {btn.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="chat-bubble bot">
            <div className="bubble loading">
              <div className="typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-group">
        <input
          type="text"
          className="chat-input"
          placeholder="답변을 입력해주세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button className="chat-send-btn" onClick={handleSend} disabled={isLoading}>
          전송
        </button>
      </div>
    </div>
  );
};

export default SidebarCustom;

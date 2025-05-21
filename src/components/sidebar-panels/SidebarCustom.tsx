import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { marked } from "marked";
import "../../styles/SidebarCustom.css";
import logoImg from "../../assets/img/chatbot-logo.png";

const keywords = ["강남구", "30평대", "전세", "매매", "학군"];

const SidebarCustom = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
  const userName = userInfo?.name || "이민희";
  const userAddress = userInfo?.address || "";
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string; time?: string }[]>([]);
  useEffect(() => {
    const setInitialBotMessage = async () => {
      const initialBotText = `${userName}님, 안녕하세요 👋\n\n${
        userAddress ? `현재 설정된 주소는 '${userAddress}'입니다. 해당 지역을 기준으로 매물을 안내드릴게요!\n\n` : ""
      }궁금하신 조건을 입력하시거나,\n아래 항목 중 하나를 선택해 주세요.`;
      const markedText = await marked(initialBotText);
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages([{ from: "bot", text: markedText, time }]);
    };

    setInitialBotMessage();
  }, []);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [followUpOptions, setFollowUpOptions] = useState<{ text: string; value: string }[]>([]);

  const handleSend = (text?: string) => {
    const finalText = text ?? input;
    if (!finalText.trim()) return;
    sendMessage(finalText);
    setInput("");
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { from: "user", text, time: currentTime }]);
    setInput("");
    setIsLoading(true);
    setFollowUpOptions([]);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `너는 안전지역의 부동산 매물 추천 전문가야. 사용자가 입력한 지역, 평수, 전세/매매 조건에 맞춰 안전한 지역의 매물만 추천해줘. 이모티콘을 사용해서 사용자 친화적으로 알려줘.${
                userAddress ? ` 참고로 사용자의 주소는 '${userAddress}'야.` : ""
              }`,
            },
            ...messages.map((msg) => ({
              role: msg.from === "user" ? "user" : "assistant",
              content: msg.text,
            })),
            { role: "user", content: text },
          ],
          temperature: 0.6,
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const botReplyRaw = response.data.choices[0].message.content;
      const botReply = await marked(botReplyRaw);
      setMessages((prev) => [...prev, { from: "bot", text: botReply, time: currentTime }]);
    } catch (error) {
      setMessages((prev) => [...prev, { from: "bot", text: "죄송해요, 응답에 실패했어요 😢", time: currentTime }]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMainSelect = (category: string) => {
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    switch (category) {
      case "safe-area":
        sendMessage("📍 지금 제일 안전한 동네 추천해줘");
        break;
      case "station":
        setMessages((prev) => [...prev, { from: "bot", text: "어떤 교통 수단이 더 편하신가요?", time: currentTime }]);
        setFollowUpOptions([
          { text: "🚆 지하철역 근처", value: "지하철역 근처 매물 추천해줘" },
          { text: "🚌 버스 정류장 근처", value: "버스 정류장 가까운 매물 보여줘" },
        ]);
        break;
      case "kids":
        setMessages((prev) => [...prev, { from: "bot", text: "자녀의 학년대는 어떻게 되시나요?", time: currentTime }]);
        setFollowUpOptions([
          { text: "👶🏻 초등학교", value: "초등학교 근처 아이 키우기 좋은 동네 추천해줘" },
          { text: "👧🏻 중학교", value: "중학교 가까운 안전한 동네 추천해줘" },
          { text: "👨🏻 고등학교", value: "고등학교 근처 안전한 동네 매물 보여줘" },
        ]);
        break;
      case "new":
        sendMessage("🏢 신축 아파트 위주 매물 보여줘");
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { from: "bot", text: "예산 범위를 입력해주시면\n더 정확하게 추천드릴 수 있어요 💰", time: currentTime },
          ]);
        }, 500);
        break;
    }
  };

  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="sidebar-panel">
      <div className="chatbot-header-box">
        <div className="chatbot-header">
          <img src={logoImg} alt="지도 밖은 위험해 로고" className="chatbot-icon" />
          <div className="chatbot-title">
            <h1>지도 밖은 위험해 상담봇</h1>
            <p>안전한 지역의 맞춤형 매물만 추천해드립니다. 🏠</p>
          </div>
        </div>
      </div>

      <div className="chat-window">
        <div className="chat-date-label">{today}</div>

        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.from}`}>
            {msg.from === "bot" ? (
              <div className="bubble" dangerouslySetInnerHTML={{ __html: msg.text }} />
            ) : (
              <div className="bubble">{msg.text}</div>
            )}
            <div className="bubble-time">{msg.time}</div>
          </div>
        ))}
        {messages.length === 1 && (
          <div className="chat-bubble bot">
            <div className="bubble button-bubble">
              <div className="suggested-buttons">
                <button className="option-btn" onClick={() => handleMainSelect("safe-area")}>
                  📍 지금 제일 안전한 동네
                </button>
                <button className="option-btn" onClick={() => handleMainSelect("station")}>
                  🚌 교통 편한 매물
                </button>
                <button className="option-btn" onClick={() => handleMainSelect("kids")}>
                  🎓 아이 키우기 좋은 동네
                </button>
                <button className="option-btn" onClick={() => handleMainSelect("new")}>
                  🏦 신축 아파트 위주
                </button>
              </div>
            </div>
          </div>
        )}

        {followUpOptions.length > 0 && (
          <div className="chat-bubble bot">
            <div className="bubble button-bubble">
              <div className="suggested-buttons">
                {followUpOptions.map((btn, idx) => (
                  <button key={idx} className="option-btn" onClick={() => handleSend(btn.value)}>
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

      <div className="keyword-buttons">
        {keywords.map((keyword) => (
          <button key={keyword} className="keyword-btn" onClick={() => handleSend(keyword)}>
            #{keyword}
          </button>
        ))}
      </div>

      <div className="chat-input-group">
        <input
          type="text"
          className="chat-input"
          placeholder="예: 강남구 30평대 전세"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!isLoading) handleSend();
            }
          }}
        />
        <button
          className="chat-send-btn"
          onClick={() => {
            if (!isLoading) handleSend();
          }}
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default SidebarCustom;

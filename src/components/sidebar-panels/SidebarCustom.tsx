import { useState } from "react";
import axios from "axios";
import "../../styles/SideBarPanel.css";

const keywords = ["강남구", "30평대", "전세", "매매", "신축", "반려동물"];

const SidebarCustom = () => {
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([
    { from: "bot", text: "안녕하세요! 😊\n조건을 말씀해주시면 매물을 추천드릴게요." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "너는 부동산 매물 상담 전문가야. 지역, 평수, 전세/매매 유형을 기반으로 매물 추천을 도와줘.",
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

      const botReply = response.data.choices[0].message.content;
      setMessages((prev) => [...prev, { from: "bot", text: botReply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { from: "bot", text: "죄송합니다. 응답에 실패했어요. 😢" }]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sidebar-panel">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <h2>AI 매물 상담 도우미</h2>
          <p>무엇을 도와드릴까요?</p>
        </div>
      </div>

      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.from === "user" ? "user-message" : "bot-message"}>
            {msg.text}
          </div>
        ))}
        {isLoading && <div className="bot-message">답변 작성 중...</div>}
      </div>

      <div className="keyword-buttons">
        {keywords.map((keyword) => (
          <button key={keyword} className="keyword-btn" onClick={() => sendMessage(keyword)}>
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
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
        />
        <button className="chat-send-btn" onClick={() => sendMessage(input)}>
          전송
        </button>
      </div>
    </div>
  );
};

export default SidebarCustom;

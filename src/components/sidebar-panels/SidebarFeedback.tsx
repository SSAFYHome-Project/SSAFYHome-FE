import { useState } from "react";
import emailjs from "emailjs-com";
import logoImg from "../../assets/img/logo-feedback.png";
import "../../styles/SideBarPanel.css";

const SidebarFeedback = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSendMail = () => {
    if (!email || !message) {
      alert("이메일과 의견 내용을 입력해주세요.");
      return;
    }

    emailjs
      .send(
        "service_zi93dq3",
        "template_04o0ra8",
        {
          title: "[지도밖은위험해] 사용자 의견",
          from_name: name || "익명",
          from_email: email,
          message,
          to_name: "minhe8564@gmail.com",
          reply_to: email,
        },
        `${import.meta.env.VITE_EMAILJS_API_KEY}`
      )
      .then(
        () => {
          alert("피드백이 성공적으로 전송되었습니다!");
          setName("");
          setEmail("");
          setMessage("");
        },
        (error) => {
          console.error("전송 실패:", error);
          alert("메일 전송 중 오류가 발생했습니다.");
        }
      );
  };

  return (
    <div className="sidebar-panel">
      <div className="panel-header">
        <h2>의견 보내기</h2>
      </div>
      <div className="panel-header-subtitle">
        <p>
          개선 의견이나 오류 제보를 남겨주세요. <br />
          소중한 피드백은 서비스에 큰 힘이 됩니다!
        </p>
      </div>
      <img src={logoImg} alt="지도밖은위험해 로고" className="feedback-logo" />

      <input
        type="text"
        placeholder="작성자 이름 (선택)"
        className="feedback-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="이메일 주소를 입력해주세요"
        className="feedback-name"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <textarea
        placeholder="의견을 입력해주세요."
        className="feedback-textarea"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />

      <button className="send-mail-btn" onClick={handleSendMail}>
        메일 전송하기
      </button>

      <footer className="feedback-footer">
        <div className="footer-text">
          © 2025 <span>SSAFYHome</span> 지도밖은 위험해
        </div>
        <a
          href="https://github.com/SSAFYHome-Project"
          target="_blank"
          rel="noopener noreferrer"
          className="github-icon-big"
          title="GitHub 바로가기"
        >
          <svg className="github-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12 0C5.37 0 0 5.373 0 12a12 12 0 008.205 11.435c.6.11.82-.26.82-.577v-2.234c-3.338.727-4.033-1.61-4.033-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.744.083-.729.083-.729 1.205.085 1.84 1.24 1.84 1.24 1.07 1.834 2.807 1.304 3.492.997.108-.776.42-1.305.762-1.605-2.665-.303-5.466-1.335-5.466-5.933 0-1.31.465-2.382 1.235-3.222-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.518 11.518 0 016 0c2.29-1.552 3.297-1.23 3.297-1.23.654 1.653.243 2.873.12 3.176.77.84 1.233 1.913 1.233 3.222 0 4.61-2.803 5.628-5.475 5.922.432.372.816 1.105.816 2.228v3.304c0 .32.216.694.825.576A12.003 12.003 0 0024 12c0-6.627-5.373-12-12-12z"
              clipRule="evenodd"
            />
          </svg>
        </a>
      </footer>
    </div>
  );
};

export default SidebarFeedback;

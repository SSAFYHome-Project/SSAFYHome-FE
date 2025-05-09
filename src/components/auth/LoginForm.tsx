import "../styles/LoginForm.css";

const LoginForm = () => {
  return (
    <div className="auth-box">
      <button className="google-login">Google 계정으로 로그인</button>

      <input type="text" placeholder="아이디" />
      <input type="password" placeholder="비밀번호" />

      <div className="auth-actions">
        <button className="login-btn">로그인</button>
        <button className="signup-link">회원가입</button>
      </div>
    </div>
  );
};

export default LoginForm;

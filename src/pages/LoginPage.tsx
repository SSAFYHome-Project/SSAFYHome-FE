import Header from "../components/Header";
import LoginForm from "../components/auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="login-page">
      <Header />
      <div className="login-layout">
        <div className="login-content">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

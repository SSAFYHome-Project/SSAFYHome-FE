import Header from "../components/Header";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <div className="forgotPassword-page">
      <Header />
      <div className="forgotPassword-layout">
        <div className="forgotPassword-content">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

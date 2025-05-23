import Header from "../components/Header";
import ResetPasswordForm from "../components/auth/PasswordChangeForm";

const ForgotPasswordPage = () => {
  return (
    <div className="resetPassword-page">
      <Header />
      <div className="resetPassword-layout">
        <div className="resetPassword-content">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

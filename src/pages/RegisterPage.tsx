import Header from "../components/Header";
import RegisterForm from "../components/auth/RegisterForm";

const RegisterPage = () => {
  return (
    <div className="register-page">
      <Header />
      <div className="register-layout">
        <div className="register-content">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

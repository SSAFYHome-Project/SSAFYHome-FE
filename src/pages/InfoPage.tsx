import Header from "../components/Header";
import InfoForm from "../components/auth/InfoForm";

const InfoPage = () => {
  return (
    <div className="info-page">
      <Header />
      <div className="info-layout">
        <div className="info-content">
          <InfoForm />
        </div>
      </div>
    </div>
  );
};

export default InfoPage;

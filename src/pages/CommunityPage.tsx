import Header from "../components/Header";
import Community from "../components/Community";

const CommunityPage = () => {
  return (
    <div className="community-page">
      <Header />
      <div className="community-layout">
        <div className="community-content">
          <Community />
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;

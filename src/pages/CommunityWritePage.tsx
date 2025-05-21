import Header from "../components/Header";
import CommunityWrite from "../components/CommunityWrite";

const CommunityWritePage = () => {
  return (
    <div className="community-page">
      <Header />
      <div className="community-layout">
        <div className="community-content">
          <CommunityWrite />
        </div>
      </div>
    </div>
  );
};

export default CommunityWritePage;

import Header from "../components/Header";
import CommunityDetail from "../components/CommunityDetail.tsx";

const CommunityWritePage = () => {
  return (
    <div className="community-page">
      <Header />
      <div className="community-layout">
        <div className="community-content">
          <CommunityDetail />
        </div>
      </div>
    </div>
  );
};

export default CommunityWritePage;

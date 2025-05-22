import Header from "../components/Header";
import CommunityEdit from "../components/CommunityEdit";

const CommunityWritePage = () => {
  return (
    <div className="community-page">
      <Header />
      <div className="community-layout">
        <div className="community-content">
          <CommunityEdit />
        </div>
      </div>
    </div>
  );
};

export default CommunityWritePage;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/DistancePanel.css";
import schoolMarker from "../../assets/img/school.png";
import companyMarker from "../../assets/img/company.png";

interface AddressInfo {
  title: string;
  address: string;
  detailAddress: string;
  x: string;
  y: string;
}

interface Props {
  isLoggedIn: boolean;
  userLocation: {
    name: string;
    carDistance: number;
    carTime: number;
    walkTime: string;
  } | null;
  onSelectLocation: (x: number, y: number, name: string) => void;
}

const DistancePanel = ({ isLoggedIn, userLocation, onSelectLocation }: Props) => {
  const navigate = useNavigate();
  const [addressList, setAddressList] = useState<AddressInfo[]>([]);

  useEffect(() => {
    const getUserInfo = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const response = await axios.get("/api/user/info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        if (data.address) {
          setAddressList(data.address);
        }
      } catch (error) {
        console.error("유저 정보 불러오기 실패:", error);
      }
    };

    getUserInfo();
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="distance-panel">
        <h3>로그인 필요</h3>
        <p>
          거리 비교 기능은
          <br />
          로그인 후 이용할 수 있습니다.
        </p>
        <button className="register-button" onClick={() => navigate("/login")}>
          로그인 하기
        </button>
      </div>
    );
  }

  return (
    <div className="distance-panel">
      <h3>거리 비교</h3>
      <p>
        회원님의 직장 / 학교 정보와
        <br />
        매물 간의 거리를 비교해보세요!
      </p>

      {addressList.length > 0 ? (
        addressList.map((addr, idx) => (
          <div
            className="distance-item"
            key={idx}
            onClick={() => onSelectLocation(parseFloat(addr.x), parseFloat(addr.y), addr.title)}
            style={{ cursor: "pointer" }}
          >
            <div className="distance-title">
              <img
                src={addr.title === "SCHOOL" ? schoolMarker : companyMarker}
                alt={addr.title === "SCHOOL" ? "학교" : "직장"}
                className="distance-icon"
              />
              <strong>{addr.title === "SCHOOL" ? "학교" : "직장"}</strong>
            </div>
            <p className="distance-address">
              {addr.address} {addr.detailAddress}
            </p>
          </div>
        ))
      ) : (
        <div className="no-location">
          <p>
            현재 등록된
            <br />
            직장 / 학교가 없습니다.
          </p>
          <button className="register-button" onClick={() => navigate("/info")}>
            직장 / 학교 등록하기
          </button>
        </div>
      )}
    </div>
  );
};

export default DistancePanel;

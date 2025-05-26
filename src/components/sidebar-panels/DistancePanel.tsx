import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/DistancePanel.css";
import schoolMarker from "../../assets/img/school.png";
import companyMarker from "../../assets/img/company.png";
import schoolMarkerImg from "../../assets/img/schoolMarker.png";
import companyMarkerImg from "../../assets/img/companyMarker.png";

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
    aptName: string;
    name: string;
    carDistance: number;
    carTime: number;
    walkTime: string;
  } | null;
  onSelectLocation: (x: number, y: number, name: string) => void;
  setUserLocation: (location: { name: string; carDistance: number; carTime: number; walkTime: string }) => void;
}

const DistancePanel = ({ isLoggedIn, userLocation, onSelectLocation, setUserLocation }: Props) => {
  const navigate = useNavigate();
  const [addressList, setAddressList] = useState<AddressInfo[]>([]);
  const polylineRef = useRef<any>(null);
  const distanceOverlayRef = useRef<any>(null);

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

  const fetchRouteInfo = async (title: string) => {
    try {
      const dealX = localStorage.getItem("dealX");
      const dealY = localStorage.getItem("dealY");
      const token = localStorage.getItem("accessToken");

      if (!dealX || !dealY) {
        console.warn("매물 위치 정보가 없습니다.");
        return null;
      }

      const response = await axios.post(
        "/api/map/route",
        {
          dealX,
          dealY,
          title,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("거리 정보 불러오기 실패:", error);
      return null;
    }
  };

  const handleClick = async (addr: AddressInfo) => {
    const kakao = (window as any).kakao;
    const latlng = new kakao.maps.LatLng(Number(addr.y), Number(addr.x));

    const markerImage = new kakao.maps.MarkerImage(
      addr.title === "SCHOOL" ? schoolMarkerImg : companyMarkerImg,
      new kakao.maps.Size(36, 40)
    );
    console.log(markerImage);

    const map = (window as any).mapInstance?.current;
    if (map) {
      map.panTo(latlng);
      new kakao.maps.Marker({
        map,
        position: latlng,
        title: addr.title,
        image: markerImage,
      });
    }

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    if (distanceOverlayRef.current) {
      distanceOverlayRef.current.setMap(null);
    }

    const dealLatLng = new kakao.maps.LatLng(
      Number(localStorage.getItem("dealY")),
      Number(localStorage.getItem("dealX"))
    );
    const targetLatLng = new kakao.maps.LatLng(Number(addr.y), Number(addr.x));

    const polyline = new kakao.maps.Polyline({
      path: [dealLatLng, targetLatLng],
      strokeWeight: 4,
      strokeColor: "#007bff",
      strokeOpacity: 0.8,
      strokeStyle: "solid",
    });

    polyline.setMap(map);
    polylineRef.current = polyline;

    const result = await fetchRouteInfo(addr.title);
    if (result) {
      const location = {
        aptName: localStorage.getItem("dealTitle"),
        name: addr.title === "SCHOOL" ? "학교" : "직장",
        carDistance: result.distanceKm,
        carTime: result.durationMin,
        walkTime: `${Math.round(result.distanceKm * 14)}분`,
      };

      setUserLocation(location);

      onSelectLocation(Number(addr.x), Number(addr.y), addr.title);
    }
  };

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
          <div className="distance-item" key={idx} onClick={() => handleClick(addr)} style={{ cursor: "pointer" }}>
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

            {userLocation?.name === (addr.title === "SCHOOL" ? "학교" : "직장") && (
              <div className="distance-result-box">
                <div className="distance-result-title">
                  <strong>{userLocation.name}</strong> → {userLocation.aptName}
                </div>
                <div className="distance-result-info">
                  차량: {userLocation.carTime}분 ({userLocation.carDistance.toFixed(1)}km)
                  <br />
                  도보: {userLocation.walkTime}
                </div>
              </div>
            )}
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

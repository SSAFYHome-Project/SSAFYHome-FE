import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../styles/MapView.css";

const KAKAO_JS_API_KEY = import.meta.env.VITE_KAKAO_JS_API_KEY;

interface MapViewProps {
  filterValues: {
    regionCode: string;
    yyyymm: string;
  } | null;
}

const MapView = ({ filterValues }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [showDistancePanel, setShowDistancePanel] = useState(false);
  const [aptList, setAptList] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<null | {
    name: string;
    carDistance: number;
    carTime: number;
    walkTime: string;
  }>(null);

  const isLoggedIn = !!localStorage.getItem("accessToken");

  const loadKakaoScript = () => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).kakao?.maps) return resolve();

      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_API_KEY}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = () => {
        (window as any).kakao.maps.load(resolve);
      };
      script.onerror = () => reject(new Error("카카오 지도 스크립트 로딩 실패"));
      document.head.appendChild(script);
    });
  };

  const renderMarkers = (items: any[]) => {
    const kakao = (window as any).kakao;
    const geocoder = new kakao.maps.services.Geocoder();

    items.forEach((apt) => {
      const address = `${apt.aptNm} ${apt.aptDong || ""}`;

      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const latlng = new kakao.maps.LatLng(result[0].y, result[0].x);

          const marker = new kakao.maps.Marker({
            map: mapInstance.current,
            position: latlng,
            title: apt.aptNm,
          });

          const infoWindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:13px;"><b>${apt.aptNm}</b><br/>거래가: ${apt.dealAmount}만원</div>`,
          });

          kakao.maps.event.addListener(marker, "click", () => {
            infoWindow.open(mapInstance.current, marker);
          });
        }
      });
    });
  };

  const getDealData = async (dongCode: string, yyymm: string) => {
    try {
      const response = await axios.get("/api/map/search?dongCode=${dongCode}&yyyymm=${yyymm}");
      const items = response.data?.trade?.response?.body?.items?.item || [];
      console.log("불러온 매물 데이터:", items);

      setAptList(items);
      renderMarkers(items);
    } catch (error) {
      console.log(dongCode, yyymm);
      console.error("실거래 데이터 불러오기 실패", error);
    }
  };

  useEffect(() => {
    const initMap = async () => {
      try {
        await loadKakaoScript();
        const kakao = (window as any).kakao;

        if (!mapRef.current) return;

        const map = new kakao.maps.Map(mapRef.current, {
          center: new kakao.maps.LatLng(37.5665, 126.978),
          level: 5,
        });
        mapInstance.current = map;

        map.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
        map.addControl(new kakao.maps.MapTypeControl(), kakao.maps.ControlPosition.TOPRIGHT);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            const latlng = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            map.setCenter(latlng);

            new kakao.maps.Marker({
              map,
              position: latlng,
              image: new kakao.maps.MarkerImage("/src/assets/img/marker.png", new kakao.maps.Size(60, 60)),
            });
          });
        }
      } catch (err) {
        console.error("지도 초기화 실패:", err);
      }
    };

    initMap();

    // setUserLocation({
    //   name: "멀티캠퍼스 역삼",
    //   carDistance: 6.2,
    //   carTime: 18,
    //   walkTime: "1시간 10분",
    // });
  }, []);

  useEffect(() => {
    if (filterValues) {
      getDealData(filterValues.regionCode, filterValues.yyyymm);
    }
  }, [filterValues]);

  const handleCurrentLocation = () => {
    const kakao = (window as any).kakao;
    if (navigator.geolocation && mapInstance.current) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const latlng = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        mapInstance.current.setCenter(latlng);

        new kakao.maps.Marker({
          map: mapInstance.current,
          position: latlng,
          image: new kakao.maps.MarkerImage("/src/assets/img/marker.png", new kakao.maps.Size(60, 60)),
        });
      });
    }
  };

  return (
    <div className="map-wrapper">
      <div ref={mapRef} id="map" className="map-container" />
      <div className="map-button" style={{ left: 20 }}>
        <button onClick={handleCurrentLocation}>내 위치</button>
      </div>

      {!isLoggedIn && (
        <>
          <div className={`map-button-distance ${showDistancePanel ? "active" : ""}`} style={{ left: 110 }}>
            <button onClick={() => setShowDistancePanel((prev) => !prev)}>
              {showDistancePanel ? "거리 비교 닫기" : "거리 비교 보기"}
            </button>
          </div>

          {showDistancePanel && (
            <div className="distance-panel">
              <h3>거리 비교 결과</h3>
              <p>
                회원님의 직장 / 학교 정보와
                <br />
                매물 간의 거리를 비교해보세요.
              </p>

              {userLocation ? (
                <div className="distance-item">
                  <strong>{userLocation.name}</strong>
                  <p>
                    자동차 : {userLocation.carDistance}km / {userLocation.carTime}분
                  </p>
                  <p>도보 : {userLocation.walkTime}</p>
                </div>
              ) : (
                <div className="no-location">
                  <p>
                    현재 등록된
                    <br />
                    직장 / 학교가 없습니다.
                  </p>
                  <button className="register-button" onClick={() => (window.location.href = "/info")}>
                    직장 / 학교 등록하기
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MapView;

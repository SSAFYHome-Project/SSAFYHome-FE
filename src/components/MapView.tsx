import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../styles/MapView.css";
import myLocation from "../assets/img/my-location-marker.png";
import DistancePanel from "../components/sidebar-panels/DistancePanel";

import { renderMarkersByType, clearOverlays, DealItemRaw } from "../hooks/useMapOverlay";

const KAKAO_JS_API_KEY = import.meta.env.VITE_KAKAO_JS_API_KEY;

interface MapViewProps {
  filterValues: {
    sido: string;
    gugun: string;
    dong: string;
    regionCode: string;
    yyyymm: string;
  } | null;
  activeType: "전체" | "매매" | "전월세";
  setActiveType: (type: "전체" | "매매" | "전월세") => void;
  onUpdateDeals: (trades: DealItemRaw[], rents: DealItemRaw[]) => void;
}

const MapView = ({ filterValues, activeType, setActiveType, onUpdateDeals }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [showDistancePanel, setShowDistancePanel] = useState(false);
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

  const dealTypes: ("전체" | "매매" | "전월세")[] = ["전체", "매매", "전월세"];

  const handleCycleType = () => {
    const currentIndex = dealTypes.indexOf(activeType);
    const nextIndex = (currentIndex + 1) % dealTypes.length;
    setActiveType(dealTypes[nextIndex]);
  };

  const getDealData = async (regionCode: string, yyyymm: string) => {
    try {
      const response = await axios.get(`/api/map/search?regionCode=${regionCode}&yyyymm=${yyyymm}`);

      const tradeItems = response.data?.trade?.response?.body?.items?.item || [];
      const rentItems = response.data?.rent?.response?.body?.items?.item || [];

      const limitedTrade = tradeItems.slice(0, 100);
      const limitedRent = rentItems.slice(0, 100);

      clearOverlays();

      if (activeType === "전체" || activeType === "매매") {
        renderMarkersByType(limitedTrade, "매매", mapInstance.current);
      }
      if (activeType === "전체" || activeType === "전월세") {
        renderMarkersByType(limitedRent, "전월세", mapInstance.current);
      }

      console.log(limitedRent);
      onUpdateDeals(limitedTrade, limitedRent);
    } catch (error) {
      console.error("실거래 데이터 불러오기 실패", error);
    }
  };

  const moveMapByFilters = (filters: { sido: string; gugun: string; dong: string }) => {
    const kakao = (window as any).kakao;
    if (!kakao?.maps || !mapInstance.current) return;

    const address = `${filters.sido} ${filters.gugun} ${filters.dong}`;
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        mapInstance.current.panTo(coords);
      } else {
        console.warn("주소 → 좌표 변환 실패:", address);
      }
    });
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
            map.panTo(latlng);

            const markerImage = new kakao.maps.MarkerImage(myLocation, new kakao.maps.Size(36, 40));
            new kakao.maps.Marker({ map, position: latlng, image: markerImage });
          });
        }
      } catch (err) {
        console.error("지도 초기화 실패:", err);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    const kakao = (window as any).kakao;
    if (filterValues && kakao?.maps) {
      moveMapByFilters({
        sido: filterValues.sido,
        gugun: filterValues.gugun,
        dong: filterValues.dong,
      });
      getDealData(filterValues.regionCode, filterValues.yyyymm);
    }
  }, [filterValues, activeType]);

  return (
    <div className="map-wrapper">
      <div ref={mapRef} id="map" className="map-container" />

      <div className="map-button" style={{ left: 20 }}>
        <button
          onClick={() => {
            if (navigator.geolocation && mapInstance.current) {
              navigator.geolocation.getCurrentPosition((pos) => {
                const kakao = (window as any).kakao;
                const latlng = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                console.log("📍 현재 위치 좌표:", latlng);

                mapInstance.current.panTo(latlng);

                const markerImage = new kakao.maps.MarkerImage(myLocation, new kakao.maps.Size(36, 40));
                const marker = new kakao.maps.Marker({
                  map: mapInstance.current,
                  position: latlng,
                  image: markerImage,
                });

                console.log("🪧 생성된 마커:", marker);
              });
            }
          }}
        >
          내 위치
        </button>
      </div>

      <div className={`map-button-distance ${showDistancePanel ? "active" : ""}`} style={{ left: 110 }}>
        <button onClick={() => setShowDistancePanel((prev) => !prev)}>
          {showDistancePanel ? "거리 비교 닫기" : "거리 비교 보기"}
        </button>
      </div>

      <div className="map-button-group">
        <button className="map-blue-button" onClick={handleCycleType}>
          {activeType}
          <span className="arrow">▼</span>
        </button>
      </div>

      {showDistancePanel && (
        <DistancePanel
          isLoggedIn={isLoggedIn}
          userLocation={userLocation}
          onSelectLocation={(x, y, name) => {
            const kakao = (window as any).kakao;
            const latlng = new kakao.maps.LatLng(y, x);
            mapInstance.current.panTo(latlng);
            new kakao.maps.Marker({
              map: mapInstance.current,
              position: latlng,
              title: name,
            });
            setUserLocation({
              name,
              carDistance: 0,
              carTime: 0,
              walkTime: "0분",
            });
          }}
        />
      )}
    </div>
  );
};

export default MapView;

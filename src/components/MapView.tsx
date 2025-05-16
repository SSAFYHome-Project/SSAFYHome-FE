import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../styles/MapView.css";
import myLocation from "../assets/img/my-location-marker.png";
import rentMarker from "../assets/img/rent-marker.png";
import tradeMarker from "../assets/img/trade-marker.png";

const KAKAO_JS_API_KEY = import.meta.env.VITE_KAKAO_JS_API_KEY;

interface DealItemRaw {
  aptNm: string;
  dealAmount?: string;
  deposit?: string;
  buildYear: number;
  excluUseAr?: number;
  floor?: number;
  roadAddr?: string;
  umdNm?: string;
  jibun?: string;
  monthlyRent?: string;
  [key: string]: any;
}

interface MapViewProps {
  filterValues: {
    sido: string;
    gugun: string;
    dong: string;
    regionCode: string;
    yyyymm: string;
  } | null;
  onUpdateDeals: (trades: DealItemRaw[], rents: DealItemRaw[]) => void;
}

const MapView = ({ filterValues, onUpdateDeals }: MapViewProps) => {
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

  const formatDealLabel = (apt: DealItemRaw, type: "매매" | "전월세") => {
    const formatNumber = (num: number) => {
      return num >= 10000 ? (num / 10000).toFixed(2).replace(/\.?0+$/, "") + "억" : num.toLocaleString() + "만원";
    };

    if (type === "매매") {
      const deal = parseInt(String(apt.dealAmount ?? "0").replace(/,/g, ""));
      return `실거래가: ${formatNumber(deal)}`;
    }

    const deposit = parseInt(String(apt.deposit ?? "0").replace(/,/g, ""));
    const rent = parseInt(String(apt.monthlyRent ?? "0").replace(/,/g, ""));

    if (rent === 0) {
      return `전세가: ${formatNumber(deposit)}`;
    } else {
      return `보증금: ${formatNumber(deposit)} / 월세: ${rent.toLocaleString()}만원`;
    }
  };

  let openInfoWindow: any = null;

  const renderMarkersByType = (items: DealItemRaw[], type: "매매" | "전월세") => {
    const kakao = (window as any).kakao;
    const geocoder = new kakao.maps.services.Geocoder();

    items.forEach((apt) => {
      const address = `${apt.roadAddr || apt.umdNm || ""} ${apt.jibun || ""}`.trim();

      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          const latlng = new kakao.maps.LatLng(result[0].y, result[0].x);
          const markerImage = new kakao.maps.MarkerImage(
            type === "매매" ? tradeMarker : rentMarker,
            new kakao.maps.Size(40, 40)
          );

          const marker = new kakao.maps.Marker({
            map: mapInstance.current,
            position: latlng,
            title: apt.aptNm,
            image: markerImage,
          });

          const infoWindow = new kakao.maps.InfoWindow({
            content: `
              <div style="
                padding: 12px 16px;
                font-size: 13px;
                font-family: 'Apple SD Gothic Neo', sans-serif;
                color: #333;
                min-width: 230px;
                max-width: 280px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              ">
                <div style="
                  font-size: 14px;
                  font-weight: bold;
                  margin-bottom: 6px;
                  color: #2a2a2a;
                ">
                  ${apt.aptNm}
                </div>
                <div style="margin-bottom: 4px;">
                  <span style="color: #3182f6; font-weight: bold;">
                  ${formatDealLabel(apt, type)}
                  </span>
                </div>
                <div>유형: ${type}</div>
              </div>
            `,
          });

          kakao.maps.event.addListener(marker, "mouseover", () => {
            if (openInfoWindow) openInfoWindow.close();
            infoWindow.open(mapInstance.current, marker);
            openInfoWindow = infoWindow;
          });

          kakao.maps.event.addListener(marker, "mouseout", () => {
            infoWindow.close();
            openInfoWindow = null;
          });
        } else {
          console.warn("좌표 변환 실패:", address);
        }
      });
    });
  };

  const getDealData = async (regionCode: string, yyyymm: string) => {
    try {
      const response = await axios.get(`/api/map/search?regionCode=${regionCode}&yyyymm=${yyyymm}`);

      const tradeItems = response.data?.trade?.response?.body?.items?.item || [];
      const rentItems = response.data?.rent?.response?.body?.items?.item || [];

      const limitedTrade = tradeItems.slice(0, 120);
      const limitedRent = rentItems.slice(0, 120);

      console.log("매매 (120개):", limitedTrade);
      console.log("전월세 (120개):", limitedRent);

      renderMarkersByType(limitedTrade, "매매");
      renderMarkersByType(limitedRent, "전월세");

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
  }, [filterValues]);

  const handleCurrentLocation = () => {
    const kakao = (window as any).kakao;
    if (navigator.geolocation && mapInstance.current && kakao?.maps) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const latlng = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        mapInstance.current.panTo(latlng);

        const markerImage = new kakao.maps.MarkerImage(myLocation, new kakao.maps.Size(36, 40));
        new kakao.maps.Marker({ map: mapInstance.current, position: latlng, image: markerImage });
      });
    }
  };

  return (
    <div className="map-wrapper">
      <div ref={mapRef} id="map" className="map-container" />
      <div className="map-button" style={{ left: 20 }}>
        <button onClick={handleCurrentLocation}>내 위치</button>
      </div>

      {isLoggedIn && (
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

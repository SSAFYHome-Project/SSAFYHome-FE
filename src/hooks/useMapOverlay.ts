export type DealItemRaw = {
  aptNm: string;
  roadAddr?: string;
  umdNm?: string;
  jibun?: string;
  dealAmount?: string | number;
  deposit?: string | number;
  monthlyRent?: string | number;
  excluUseAr?: number;
  area?: number;
  floor?: number;
};

let openInfoWindow: any = null;
const overlayList: any[] = [];

export const clearOverlays = () => {
  overlayList.forEach((o) => o.setMap(null));
  overlayList.length = 0;
};

export const renderMarkersByType = (items: DealItemRaw[], type: "매매" | "전월세", mapInstance: any) => {
  const kakao = (window as any).kakao;
  const geocoder = new kakao.maps.services.Geocoder();
  const bgColor = "#3182f6";

  items.forEach((apt) => {
    const address = `${apt.roadAddr || apt.umdNm || ""} ${apt.jibun || ""}`.trim();

    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const latlng = new kakao.maps.LatLng(result[0].y, result[0].x);
        console.log(latlng);

        const formatNumber = (num: number) => {
          return num >= 10000 ? (num / 10000).toFixed(2).replace(/\.0+$/, "") + "억" : num.toLocaleString() + "만원";
        };

        const parseNumeric = (val: string | number | undefined): number => {
          if (typeof val === "number") return val;
          if (typeof val === "string") return parseInt(val.replace(/,/g, ""), 10);
          return 0;
        };

        const dealAmount = parseNumeric(apt.dealAmount);
        const deposit = parseNumeric(apt.deposit);
        const rent = parseNumeric(apt.monthlyRent);
        const pyeong = apt.excluUseAr ? `${Math.round(apt.excluUseAr * 0.3025)}평` : "";

        let shortLabel = "";
        if (type === "매매") {
          shortLabel = formatNumber(dealAmount);
        } else {
          shortLabel = rent === 0 ? formatNumber(deposit) : `${formatNumber(deposit)} / ${rent.toLocaleString()}만원`;
        }

        const bubble = document.createElement("div");
        bubble.className = "custom-overlay-bubble";
        bubble.style.position = "relative";
        bubble.style.background = bgColor;
        bubble.style.color = "white";
        bubble.style.fontSize = "10px";
        bubble.style.padding = "6px 10px";
        bubble.style.borderRadius = "10px";
        bubble.style.textAlign = "center";
        bubble.style.whiteSpace = "nowrap";
        bubble.style.cursor = "pointer";
        bubble.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
        bubble.innerHTML = `
          ${
            type === "매매"
              ? `
            <div style="
              position: absolute;
              top: -12px;
              left: 50%;
              transform: translateX(-50%);
              background: #F26671;
              color:rgb(255, 255, 255);
              font-size: 10px;
              padding: 2px 6px;
              border-radius: 10px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.15);
            ">매매</div>
          `
              : ""
          }
          ${pyeong}<br/>
          <span style="font-size: 14px;">${shortLabel}</span>
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid ${bgColor};
          "></div>
        `;

        // bubble.onclick = () => {
        //   window.location.href = `/apt-detail?name=${encodeURIComponent(apt.aptNm)}`;
        // };

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
              <strong style="font-size: 14px;">${apt.aptNm}</strong><br/>
              ${shortLabel}<br/>
              전용: ${apt.excluUseAr}㎡ / ${pyeong}<br/>
              층: ${apt.floor ?? "-"}층
            </div>
          `,
        });

        const dummyMarker = new kakao.maps.Marker({
          position: latlng,
          opacity: 0,
        });

        bubble.addEventListener("mouseenter", () => {
          if (openInfoWindow) openInfoWindow.close();
          infoWindow.open(mapInstance, dummyMarker);
          openInfoWindow = infoWindow;
        });

        bubble.addEventListener("mouseleave", () => {
          infoWindow.close();
          openInfoWindow = null;
        });

        const overlay = new kakao.maps.CustomOverlay({
          position: latlng,
          content: bubble,
          yAnchor: 1.4,
        });

        overlay.setMap(mapInstance);
        overlayList.push(overlay);
      } else {
        console.warn("주소 변환 실패:", address);
      }
    });
  });
};

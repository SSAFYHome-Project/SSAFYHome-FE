const useDaumPostcode = () => {
  const open = (onComplete: (result: { address: string; detailAddress: string; x: string; y: string }) => void) => {
    new (window as any).daum.Postcode({
      oncomplete: async (data: any) => {
        const fullAddress = data.address;
        const detailAddress = data.buildingName || "";

        try {
          const geocoder = new (window as any).daum.maps.services.Geocoder();
          geocoder.addressSearch(fullAddress, (result: any, status: string) => {
            if (status === (window as any).daum.maps.services.Status.OK) {
              const x = result[0].x;
              const y = result[0].y;

              onComplete({
                address: fullAddress,
                detailAddress,
                x,
                y,
              });
            } else {
              onComplete({
                address: fullAddress,
                detailAddress,
                x: "",
                y: "",
              });
            }
          });
        } catch (e) {
          console.error("좌표 변환 실패", e);
          onComplete({
            address: fullAddress,
            detailAddress,
            x: "",
            y: "",
          });
        }
      },
    }).open();
  };

  return open;
};

export default useDaumPostcode;

const useDaumPostcode = () => {
    const open = (onComplete: (address: string) => void) => {
      new (window as any).daum.Postcode({
        oncomplete: (data: any) => {
          const fullAddress = data.address;
          onComplete(fullAddress);
        },
      }).open();
    };
  
    return open;
  };
  
  export default useDaumPostcode;
  
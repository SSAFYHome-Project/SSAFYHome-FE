export const getCrimeWMSImageURL = (bbox: string, width: number, height: number) => {
  return `/api/map/image?bbox=${bbox}&width=${width}&height=${height}`;
};

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jwt = params.get("jwtAccessToken");
    const error = params.get("error");

    if (jwt) {
      localStorage.setItem("accessToken", jwt);
      navigate("/");
    } else if (error) {
      alert(decodeURIComponent(error));
      navigate("/login");
    }
  }, []);
};

export default OAuthCallback;

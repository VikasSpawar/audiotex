import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import SetNewPasswordPage from "./SetNewPassword";
import ResetPasswordPage from "./ResetPasswordRequest";

function ResetPasswordWrapper() {
  const location = useLocation();
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Parse the access token from URL hash (e.g., "#access_token=xyz")
    const hash = location.hash; // "#access_token=xyz&..."
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // Remove '#' part
      const accessToken = params.get("access_token") || params.get("token");
      if (accessToken) {
        setToken(accessToken);
      }
    }
  }, [location]);

  // If token is present, show the set new password page
  if (token) {
    return <SetNewPasswordPage accessToken={token} />;
  }

  // Otherwise, show the request reset email page
  return <ResetPasswordPage />;
}

export default ResetPasswordWrapper;

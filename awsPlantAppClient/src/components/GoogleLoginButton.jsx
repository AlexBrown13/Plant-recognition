import { GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";

export default function GoogleLoginButton() {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        const decoded = jwtDecode(credentialResponse.credential);

        console.log("User info:", decoded);

        // Save token
        localStorage.setItem("google_id_token", credentialResponse.credential);
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
}

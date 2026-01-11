import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function LoginGoogle() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          // save token for API calls
          localStorage.setItem("google_id_token", credentialResponse.credential);

          // optional: decode for UI/debug
          const user = jwtDecode(credentialResponse.credential);
          console.log("user:", user);

          navigate("/");
        }}
        onError={() => alert("google login failed")}
      />
    </div>
  );
}

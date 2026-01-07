import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export default function LoginGoogle() {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          const user = jwtDecode(credentialResponse.credential);
          login(user, credentialResponse.credential); // updates state
          navigate("/"); // redirect after login
          //console.log("navigate to home page");
        }}
        onError={() => {
          alert("Google Login Failed");
        }}
      />
    </div>
  );
}

import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

export default function LoginGoogle() {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          const idToken = credentialResponse?.credential;
          if (!idToken) {
            alert("missing google credential");
            return;
          }

          // decode for UI (name, picture, email, sub)
          const user = jwtDecode(idToken);

          // store both consistently
          login(user, idToken);

          // if you want redirect back, keep it simple:
          const next = localStorage.getItem("post_login_redirect");
          if (next) {
            localStorage.removeItem("post_login_redirect");
            navigate(next);
          } else {
            navigate("/");
          }
        }}
        onError={() => alert("google login failed")}
      />
    </div>
  );
}

import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { saveUser } from "../utils/api";

export default function LoginGoogle() {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const idToken = credentialResponse?.credential;
          if (!idToken) {
            alert("missing google credential");
            return;
          }

          // quick local login (for UI)
          const decoded = jwtDecode(idToken);
          login(decoded, idToken);

          // sync / create user in your DB (lambda)
          try {
            const saved = await saveUser(); // should return user record
            login(saved, idToken); // replace with canonical db record
          } catch (e) {
            console.log("save-user failed:", e);
            // still logged in locally even if db call fails
          }

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

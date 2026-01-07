import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";

import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

//import { auth } from "../utils/api";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const { user, logout, login } = useContext(UserContext);

  //const isAuthenticated = auth.isAuthenticated();

  const handleMyPlantsClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate("/login");
    }
  };

  // const googleLogin = useGoogleLogin({
  //   onSuccess: (credentialResponse) => {
  //     // Decode token to get user info
  //     console.log("credentialResponse: " + credentialResponse);
  //     const userData = jwtDecode(credentialResponse.credential);
  //     login(userData, credentialResponse.credential); // update context
  //   },
  //   onError: () => {
  //     alert("Google Login Failed");
  //   },
  // });

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Fetch user info using access_token
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });

      const userData = await res.json();

      // Save user + token
      login(userData, tokenResponse.access_token);
      navigate("/");
    },
    onError: () => {
      alert("Google Login Failed");
    },
  });

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          🌱 Plant Recognition
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/my-plants" className="nav-link">
            My Plants
          </Link>

          {user ? (
            <>
              <button
                className="btn-logout"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button className="btn-login" onClick={() => googleLogin()}>
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;

import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const { user, logout, login } = useContext(UserContext);
  const API_SAVE_USER = import.meta.env.VITE_API_SAVE_USER;

  const [pendingNavigation, setPendingNavigation] = useState(null);

  const googleLogin = useGoogleLogin({
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;

      const res = await fetch(`${API_SAVE_USER}/prod/save-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const userData = await res.json();
      login(userData, accessToken);

      if (pendingNavigation) {
        navigate(pendingNavigation);
        setPendingNavigation(null);
      }
    },
    onError: () => {
      console.log("Google login failed");
    },
  });

  const handleMyPlantsClick = (e) => {
    e.preventDefault();

    if (!user) {
      setPendingNavigation("/my-plants");
      googleLogin();
    } else {
      navigate("/my-plants");
    }
  };

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
          <Link
            to="/my-plants"
            onClick={handleMyPlantsClick}
            className="nav-link"
          >
            My Plants
          </Link>

          {user ? (
            <>
              <img
                src={user.picture}
                alt={user.name}
                className="profile-icon"
              />
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

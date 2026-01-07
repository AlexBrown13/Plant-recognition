import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const { user, logout, login } = useContext(UserContext);

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
      //navigate("/");
    },
    onError: () => {
      alert("Google Login Failed");
    },
  });

  const handleMyPlantsClick = () => {
    if (!user) {
      //navigate("/login"); // redirect if not logged in
      googleLogin();
      navigate("/my-plants");
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

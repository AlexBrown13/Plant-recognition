import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const { user, logout, login } = useContext(UserContext);
  const API_SAVE_USER = import.meta.env.VITE_API_SAVE_USER;

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info using access_token
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const userData = await res.json();

        await saveUserToDynamo(userData);

        // Save user + token
        login(userData, tokenResponse.access_token);
      } catch (err) {
        console.error("Google login error:", err);
        alert("Google Login Failed");
      }
    },
    onError: () => {
      alert("Google Login Failed");
    },
  });

  // Function to save user
  const saveUserToDynamo = async (userData) => {
    try {
      await fetch(`${API_SAVE_USER}/prod/save-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sub: userData.sub,
          name: userData.name,
          email: userData.email,
        }),
      });
      console.log("User saved to DynamoDB");

      //await api.saveUser(userData);
      //console.log("User saved to DynamoDB");
    } catch (err) {
      console.error("Failed to save user:", err);
    }
  };

  const handleMyPlantsClick = () => {
    if (!user) {
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

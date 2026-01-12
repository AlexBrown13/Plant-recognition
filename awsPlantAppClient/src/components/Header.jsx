import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  const [pendingNavigation, setPendingNavigation] = useState(null);

  const hasToken = () => !!localStorage.getItem("google_id_token");

  const handleMyPlantsClick = (e) => {
    e.preventDefault();

    if (!hasToken()) {
      setPendingNavigation("/my-plants");
      navigate("/login");
      return;
    }

    navigate("/my-plants");
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

          <Link to="/my-plants" onClick={handleMyPlantsClick} className="nav-link">
            My Plants
          </Link>

          {hasToken() ? (
            <>
              {user?.picture ? (
                <img src={user.picture} alt={user.name || "user"} className="profile-icon" />
              ) : null}

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
            <button
              className="btn-login"
              onClick={() => {
                setPendingNavigation(null);
                navigate("/login");
              }}
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;

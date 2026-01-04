import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../utils/api';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const isAuthenticated = auth.isAuthenticated();

  const handleMyPlantsClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          🌱 Plant Recognition
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          {isAuthenticated ? (
            <>
              <Link to="/my-plants" className="nav-link">My Plants</Link>
              <button 
                className="btn-logout"
                onClick={() => {
                  auth.removeToken();
                  navigate('/');
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/my-plants" className="nav-link" onClick={handleMyPlantsClick}>
                My Plants
              </Link>
              <Link to="/login" className="btn-login">Login</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;


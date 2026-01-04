import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, auth } from '../utils/api';
import './MyPlants.css';

function MyPlants() {
  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate('/login');
      return;
    }

    fetchPlants();
  }, [navigate]);

  const fetchPlants = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getMyPlants();
      setPlants(Array.isArray(data.plants) ? data.plants : data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your plants. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="my-plants-container">
        <div className="loading">Loading your plants...</div>
      </div>
    );
  }

  return (
    <div className="my-plants-container">
      <div className="my-plants-content">
        <h1 className="my-plants-title">My Plants</h1>
        <p className="my-plants-subtitle">Your saved plant collection</p>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchPlants} className="btn-retry">
              Retry
            </button>
          </div>
        )}

        {plants.length === 0 && !error ? (
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h2>No plants saved yet</h2>
            <p>Start identifying plants on the home page and save them to your collection!</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Go to Home
            </button>
          </div>
        ) : (
          <div className="plants-grid">
            {plants.map((plant, index) => (
              <div key={plant.id || index} className="plant-card">
                {plant.imageUrl && (
                  <img src={plant.imageUrl} alt={plant.name} className="plant-card-image" />
                )}
                <div className="plant-card-content">
                  <h3 className="plant-card-name">{plant.name || 'Unknown Plant'}</h3>
                  
                  {plant.watering && (
                    <div className="plant-card-info">
                      <strong>💧 Watering:</strong>
                      <p>{plant.watering}</p>
                    </div>
                  )}

                  {plant.disease && (
                    <div className="plant-card-info">
                      <strong>🦠 Disease Info:</strong>
                      <p>{plant.disease}</p>
                    </div>
                  )}

                  {plant.care && (
                    <div className="plant-card-info">
                      <strong>🌿 Care:</strong>
                      <p>{plant.care}</p>
                    </div>
                  )}

                  {plant.savedAt && (
                    <div className="plant-card-date">
                      Saved on {new Date(plant.savedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPlants;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPlants } from "../utils/api";
import "./MyPlants.css";

export default function MyPlants() {
  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("google_id_token");
    if (!token) {
      navigate("/login"); // your google login page
      return;
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getMyPlants();
      const list = Array.isArray(data?.plants) ? data.plants : [];
      setPlants(list);
    } catch (e) {
      setError(e?.message || "failed to load plants");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="my-plants-container">
        <div className="loading">loading…</div>
      </div>
    );
  }

  return (
    <div className="my-plants-container">
      <div className="my-plants-content">
        <h1 className="my-plants-title">My Plants</h1>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={load} className="btn-retry">retry</button>
          </div>
        )}

        {!error && plants.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <h2>no plants yet</h2>
            <button onClick={() => navigate("/")} className="btn-primary">
              go identify
            </button>
          </div>
        )}

        <div className="plants-grid">
          {plants.map((p) => {
            const title = p.commonName || p.scientificName || "unknown";
            const subtitle =
              p.commonName && p.scientificName ? p.scientificName : null;

            return (
              <div key={`${p.perenualId ?? ""}-${p.imageKey ?? Math.random()}`} className="plant-card">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={title} className="plant-card-image" />
                ) : (
                  <div className="plant-card-image placeholder">no image</div>
                )}

                <div className="plant-card-content">
                  <h3 className="plant-card-name">{title}</h3>
                  {subtitle && <div className="plant-card-sub">{subtitle}</div>}

                  {p.watering && (
                    <div className="plant-card-info">
                      <strong>💧 watering:</strong> {p.watering}
                    </div>
                  )}

                  {Array.isArray(p.sunlight) && p.sunlight.length > 0 && (
                    <div className="plant-card-info">
                      <strong>☀️ sunlight:</strong> {p.sunlight.join(", ")}
                    </div>
                  )}

                  {p.perenualId != null && (
                    <div className="plant-card-meta">perenualId: {p.perenualId}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
